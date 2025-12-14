/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from "@nestjs/config";
import { S3StorageProvider } from "../src/providers/s3.provider";
import { StorageError } from "@qckstrt/common";

// Mock the AWS SDK
const mockSend = jest.fn();
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  ListObjectsV2Command: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "ListObjectsV2" })),
  GetObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "GetObject" })),
  PutObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "PutObject" })),
  DeleteObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "DeleteObject" })),
  HeadObjectCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "HeadObject" })),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://signed-url.example.com"),
}));

describe("S3StorageProvider", () => {
  let provider: S3StorageProvider;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          region: "us-east-1",
          "s3.bucket": "test-bucket",
        };
        return config[key];
      }),
    } as unknown as ConfigService;

    provider = new S3StorageProvider(configService);
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider).toBeDefined();
      expect(provider.getName()).toBe("S3StorageProvider");
    });

    it("should use default region when not provided", () => {
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      const p = new S3StorageProvider(emptyConfigService);
      expect(p).toBeDefined();
    });
  });

  describe("listFiles", () => {
    it("should list files successfully", async () => {
      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: "user1/file1.txt",
            Size: 100,
            LastModified: new Date(),
            ETag: '"abc"',
          },
          {
            Key: "user1/file2.txt",
            Size: 200,
            LastModified: new Date(),
            ETag: '"def"',
          },
        ],
        IsTruncated: false,
      });

      const result = await provider.listFiles("test-bucket", "user1");

      expect(result.files).toHaveLength(2);
      expect(result.files[0].key).toBe("user1/file1.txt");
      expect(result.isTruncated).toBe(false);
    });

    it("should handle empty results", async () => {
      mockSend.mockResolvedValue({
        Contents: [],
        IsTruncated: false,
      });

      const result = await provider.listFiles("test-bucket", "empty-prefix");

      expect(result.files).toHaveLength(0);
    });

    it("should throw StorageError on failure", async () => {
      mockSend.mockRejectedValue(new Error("S3 error"));

      await expect(provider.listFiles("test-bucket", "user1")).rejects.toThrow(
        StorageError,
      );
    });
  });

  describe("getSignedUrl", () => {
    it("should get signed URL for download", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

      const url = await provider.getSignedUrl(
        "test-bucket",
        "user1/file.txt",
        false,
      );

      expect(url).toBe("https://signed-url.example.com");
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it("should get signed URL for upload", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

      const url = await provider.getSignedUrl(
        "test-bucket",
        "user1/file.txt",
        true,
      );

      expect(url).toBe("https://signed-url.example.com");
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it("should use custom expiration", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

      await provider.getSignedUrl("test-bucket", "user1/file.txt", false, {
        expiresIn: 7200,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 },
      );
    });

    it("should throw StorageError on failure", async () => {
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      getSignedUrl.mockRejectedValueOnce(new Error("Presigner error"));

      await expect(
        provider.getSignedUrl("test-bucket", "user1/file.txt", false),
      ).rejects.toThrow(StorageError);
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.deleteFile("test-bucket", "user1/file.txt");

      expect(result).toBe(true);
    });

    it("should throw StorageError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Delete error"));

      await expect(
        provider.deleteFile("test-bucket", "user1/file.txt"),
      ).rejects.toThrow(StorageError);
    });
  });

  describe("exists", () => {
    it("should return true if file exists", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.exists("test-bucket", "user1/file.txt");

      expect(result).toBe(true);
    });

    it("should return false if file does not exist", async () => {
      const notFoundError = new Error("Not Found");
      (notFoundError as any).name = "NotFound";
      mockSend.mockRejectedValue(notFoundError);

      const result = await provider.exists(
        "test-bucket",
        "user1/nonexistent.txt",
      );

      expect(result).toBe(false);
    });

    it("should throw StorageError on other errors", async () => {
      mockSend.mockRejectedValue(new Error("Access denied"));

      await expect(
        provider.exists("test-bucket", "user1/file.txt"),
      ).rejects.toThrow(StorageError);
    });
  });

  describe("getMetadata", () => {
    it("should return file metadata", async () => {
      const lastModified = new Date();
      mockSend.mockResolvedValue({
        ContentLength: 1024,
        LastModified: lastModified,
        ETag: '"abc123"',
      });

      const result = await provider.getMetadata(
        "test-bucket",
        "user1/file.txt",
      );

      expect(result).toEqual({
        key: "user1/file.txt",
        size: 1024,
        lastModified,
        etag: '"abc123"',
      });
    });

    it("should return null if file does not exist", async () => {
      const notFoundError = new Error("Not Found");
      (notFoundError as any).name = "NotFound";
      mockSend.mockRejectedValue(notFoundError);

      const result = await provider.getMetadata(
        "test-bucket",
        "user1/nonexistent.txt",
      );

      expect(result).toBeNull();
    });

    it("should throw StorageError on other errors", async () => {
      mockSend.mockRejectedValue(new Error("Access denied"));

      await expect(
        provider.getMetadata("test-bucket", "user1/file.txt"),
      ).rejects.toThrow(StorageError);
    });
  });
});
