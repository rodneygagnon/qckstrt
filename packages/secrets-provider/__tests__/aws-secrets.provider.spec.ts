/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from "@nestjs/config";
import { AWSSecretsProvider } from "../src/providers/aws-secrets.provider";
import { SecretsError } from "@qckstrt/common";

// Mock the AWS SDK
const mockSend = jest.fn();
jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  GetSecretValueCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "GetSecretValue" })),
}));

describe("AWSSecretsProvider", () => {
  let provider: AWSSecretsProvider;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          region: "us-east-1",
        };
        return config[key];
      }),
    } as unknown as ConfigService;

    provider = new AWSSecretsProvider(configService);
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider).toBeDefined();
      expect(provider.getName()).toBe("AWSSecretsProvider");
    });

    it("should use default region when not provided", () => {
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      const p = new AWSSecretsProvider(emptyConfigService);
      expect(p).toBeDefined();
    });
  });

  describe("getSecret", () => {
    it("should retrieve secret successfully", async () => {
      mockSend.mockResolvedValue({ SecretString: "my-secret-value" });

      const result = await provider.getSecret("my-secret-id");

      expect(result).toBe("my-secret-value");
    });

    it("should return undefined when secret not found", async () => {
      const notFoundError = new Error("Secret not found");
      (notFoundError as any).name = "ResourceNotFoundException";
      mockSend.mockRejectedValue(notFoundError);

      const result = await provider.getSecret("nonexistent-secret");

      expect(result).toBeUndefined();
    });

    it("should throw SecretsError on other errors", async () => {
      mockSend.mockRejectedValue(new Error("Access denied"));

      await expect(provider.getSecret("my-secret-id")).rejects.toThrow(
        SecretsError,
      );
    });
  });

  describe("getSecrets", () => {
    it("should retrieve multiple secrets successfully", async () => {
      mockSend
        .mockResolvedValueOnce({ SecretString: "value1" })
        .mockResolvedValueOnce({ SecretString: "value2" });

      const result = await provider.getSecrets(["secret1", "secret2"]);

      expect(result).toEqual({
        secret1: "value1",
        secret2: "value2",
      });
    });

    it("should handle mixed results with some failures", async () => {
      mockSend
        .mockResolvedValueOnce({ SecretString: "value1" })
        .mockRejectedValueOnce(new Error("Access denied"));

      const result = await provider.getSecrets(["secret1", "secret2"]);

      expect(result.secret1).toBe("value1");
      expect(result.secret2).toBeUndefined();
    });
  });

  describe("getSecretJson", () => {
    it("should parse JSON secret successfully", async () => {
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify({ username: "admin", password: "secret" }),
      });

      const result = await provider.getSecretJson<{
        username: string;
        password: string;
      }>("db-credentials");

      expect(result).toEqual({ username: "admin", password: "secret" });
    });

    it("should return undefined when secret not found", async () => {
      const notFoundError = new Error("Secret not found");
      (notFoundError as any).name = "ResourceNotFoundException";
      mockSend.mockRejectedValue(notFoundError);

      const result = await provider.getSecretJson("nonexistent-secret");

      expect(result).toBeUndefined();
    });

    it("should throw SecretsError when JSON is invalid", async () => {
      mockSend.mockResolvedValue({ SecretString: "not-valid-json" });

      await expect(
        provider.getSecretJson("invalid-json-secret"),
      ).rejects.toThrow(SecretsError);
    });
  });
});
