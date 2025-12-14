import "reflect-metadata";
import { URLExtractor } from "../src/extractors/url.extractor";
import { ExtractionError, TextExtractionInput } from "@qckstrt/common";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock NestJS Logger
jest.mock("@nestjs/common", () => ({
  Injectable: () => (target: any) => target,
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

describe("URLExtractor", () => {
  let extractor: URLExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    extractor = new URLExtractor();
  });

  describe("getName", () => {
    it("should return URLExtractor", () => {
      expect(extractor.getName()).toBe("URLExtractor");
    });
  });

  describe("supports", () => {
    it("should return true for url input type", () => {
      const input: TextExtractionInput = {
        type: "url",
        url: "https://example.com",
        userId: "user-1",
      };
      expect(extractor.supports(input)).toBe(true);
    });

    it("should return false for s3 input type", () => {
      const input: TextExtractionInput = {
        type: "s3",
        bucket: "bucket",
        key: "key",
        userId: "user-1",
      };
      expect(extractor.supports(input)).toBe(false);
    });

    it("should return false for file input type", () => {
      const input: TextExtractionInput = {
        type: "file",
        buffer: Buffer.from(""),
        mimeType: "text/plain",
        userId: "user-1",
      };
      expect(extractor.supports(input)).toBe(false);
    });
  });

  describe("extractText", () => {
    it("should extract text from URL successfully", async () => {
      const htmlContent = `
        <html>
          <head><title>Test</title></head>
          <body>
            <script>console.log('test');</script>
            <style>.test { color: red; }</style>
            <p>Hello World</p>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(htmlContent),
        headers: new Map([["content-type", "text/html"]]),
      });

      const input: TextExtractionInput = {
        type: "url",
        url: "https://example.com",
        userId: "user-1",
      };
      const result = await extractor.extractText(input);

      expect(result.text).toContain("Hello World");
      expect(result.text).not.toContain("console.log");
      expect(result.text).not.toContain("color: red");
      expect(result.metadata.source).toBe("https://example.com");
      expect(result.metadata.extractor).toBe("URLExtractor");
      expect(result.metadata.statusCode).toBe(200);
    });

    it("should throw error for non-url input type", async () => {
      const input: TextExtractionInput = {
        type: "s3",
        bucket: "bucket",
        key: "key",
        userId: "user-1",
      };

      await expect(extractor.extractText(input)).rejects.toThrow(
        "URLExtractor only supports URL inputs",
      );
    });

    it("should throw ExtractionError on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const input: TextExtractionInput = {
        type: "url",
        url: "https://example.com/notfound",
        userId: "user-1",
      };

      await expect(extractor.extractText(input)).rejects.toThrow(
        ExtractionError,
      );
    });

    it("should throw ExtractionError on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const input: TextExtractionInput = {
        type: "url",
        url: "https://example.com",
        userId: "user-1",
      };

      await expect(extractor.extractText(input)).rejects.toThrow(
        ExtractionError,
      );
    });

    it("should handle pages with no script or style tags", async () => {
      const htmlContent = "<html><body><p>Simple text</p></body></html>";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(htmlContent),
        headers: new Map([["content-type", "text/html"]]),
      });

      const input: TextExtractionInput = {
        type: "url",
        url: "https://example.com",
        userId: "user-1",
      };
      const result = await extractor.extractText(input);

      expect(result.text).toContain("Simple text");
    });
  });
});
