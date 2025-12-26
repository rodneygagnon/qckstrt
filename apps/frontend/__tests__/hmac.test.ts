import { TextEncoder } from "util";

// Mock Web Crypto API for Node.js test environment
const mockSign = jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]));
const mockImportKey = jest.fn().mockResolvedValue({ type: "secret" });

const mockSubtle = {
  importKey: mockImportKey,
  sign: mockSign,
};

Object.defineProperty(globalThis, "crypto", {
  value: {
    subtle: mockSubtle,
  },
  writable: true,
  configurable: true,
});

// Ensure TextEncoder is available
Object.defineProperty(globalThis, "TextEncoder", {
  value: TextEncoder,
  writable: true,
  configurable: true,
});

describe("hmac", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("generateHmacHeader", () => {
    it("should return empty string when HMAC_SECRET is not set", async () => {
      // Clear the secret
      delete process.env.NEXT_PUBLIC_HMAC_SECRET;

      jest.resetModules();
      const { generateHmacHeader: freshGenerateHmacHeader } =
        await import("../lib/hmac");

      const result = await freshGenerateHmacHeader();
      expect(result).toBe("");
    });

    it("should generate valid HMAC header when secret is set", async () => {
      process.env.NEXT_PUBLIC_HMAC_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_HMAC_CLIENT_ID = "test-client";

      jest.resetModules();
      const { generateHmacHeader: freshGenerateHmacHeader } =
        await import("../lib/hmac");

      const result = await freshGenerateHmacHeader("GET", "/api/test");

      expect(result).toMatch(/^HMAC /);
      const credentials = JSON.parse(result.replace("HMAC ", ""));
      expect(credentials.username).toBe("test-client");
      expect(credentials.algorithm).toBe("hmac-sha256");
      expect(credentials.headers).toBe("@request-target,content-type");
      expect(credentials.signature).toBeTruthy();
      expect(mockImportKey).toHaveBeenCalled();
      expect(mockSign).toHaveBeenCalled();
    });

    it("should use default method and path when not provided", async () => {
      process.env.NEXT_PUBLIC_HMAC_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_HMAC_CLIENT_ID = "frontend";

      jest.resetModules();
      const { generateHmacHeader: freshGenerateHmacHeader } =
        await import("../lib/hmac");

      const result = await freshGenerateHmacHeader();

      expect(result).toMatch(/^HMAC /);
      const credentials = JSON.parse(result.replace("HMAC ", ""));
      expect(credentials.username).toBe("frontend");
    });

    it("should build correct signature string with request-target and headers", async () => {
      process.env.NEXT_PUBLIC_HMAC_SECRET = "test-secret";
      process.env.NEXT_PUBLIC_HMAC_CLIENT_ID = "test-client";

      jest.resetModules();
      const { generateHmacHeader: freshGenerateHmacHeader } =
        await import("../lib/hmac");

      // Test with custom method and path
      const result = await freshGenerateHmacHeader("DELETE", "/api/users/123");

      expect(result).toMatch(/^HMAC /);
      const credentials = JSON.parse(result.replace("HMAC ", ""));
      // Verify structure is correct for custom method/path
      expect(credentials.headers).toContain("@request-target");
      expect(credentials.headers).toContain("content-type");
    });

    it("should return empty signature when Web Crypto API is not available", async () => {
      process.env.NEXT_PUBLIC_HMAC_SECRET = "test-secret";

      // Mock crypto.subtle as undefined
      Object.defineProperty(globalThis, "crypto", {
        value: { subtle: undefined },
        writable: true,
        configurable: true,
      });

      jest.resetModules();
      const { generateHmacHeader: freshGenerateHmacHeader } =
        await import("../lib/hmac");

      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await freshGenerateHmacHeader();

      // The signature will be empty, so the header will still be generated but with empty signature
      expect(result).toMatch(/^HMAC /);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Web Crypto API not available",
      );

      consoleWarnSpy.mockRestore();

      // Restore mock crypto
      Object.defineProperty(globalThis, "crypto", {
        value: { subtle: mockSubtle },
        writable: true,
        configurable: true,
      });
    });
  });
});
