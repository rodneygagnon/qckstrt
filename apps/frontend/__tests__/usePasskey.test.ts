import { renderHook, act } from "@testing-library/react";
import { usePasskey } from "@/lib/hooks/usePasskey";

// Mock WebAuthn browser APIs
const mockBrowserSupportsWebAuthn = jest.fn();
const mockPlatformAuthenticatorIsAvailable = jest.fn();
const mockStartRegistration = jest.fn();
const mockStartAuthentication = jest.fn();

jest.mock("@simplewebauthn/browser", () => ({
  browserSupportsWebAuthn: () => mockBrowserSupportsWebAuthn(),
  platformAuthenticatorIsAvailable: () =>
    mockPlatformAuthenticatorIsAvailable(),
  startRegistration: (options: unknown) => mockStartRegistration(options),
  startAuthentication: (options: unknown) => mockStartAuthentication(options),
}));

// Mock Apollo Client
const mockGenerateRegistrationOptions = jest.fn();
const mockVerifyRegistration = jest.fn();
const mockGenerateAuthenticationOptions = jest.fn();
const mockVerifyAuthentication = jest.fn();
const mockDeletePasskey = jest.fn();
const mockRefetch = jest.fn();

jest.mock("@apollo/client/react", () => ({
  useMutation: jest.fn((mutation) => {
    const mutationName = mutation?.definitions?.[0]?.name?.value;
    if (mutationName === "GeneratePasskeyRegistrationOptions") {
      return [mockGenerateRegistrationOptions, { loading: false }];
    }
    if (mutationName === "VerifyPasskeyRegistration") {
      return [mockVerifyRegistration, { loading: false }];
    }
    if (mutationName === "GeneratePasskeyAuthenticationOptions") {
      return [mockGenerateAuthenticationOptions, { loading: false }];
    }
    if (mutationName === "VerifyPasskeyAuthentication") {
      return [mockVerifyAuthentication, { loading: false }];
    }
    if (mutationName === "DeletePasskey") {
      return [mockDeletePasskey, { loading: false }];
    }
    return [jest.fn(), { loading: false }];
  }),
  useQuery: jest.fn(() => ({
    data: { myPasskeys: [] },
    loading: false,
    refetch: mockRefetch,
  })),
}));

describe("usePasskey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBrowserSupportsWebAuthn.mockReturnValue(true);
    mockPlatformAuthenticatorIsAvailable.mockResolvedValue(true);
    mockRefetch.mockResolvedValue({ data: { myPasskeys: [] } });
  });

  describe("initial state", () => {
    it("should have correct initial state", async () => {
      const { result } = renderHook(() => usePasskey());

      // Wait for useEffect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.passkeys).toEqual([]);
    });

    it("should detect WebAuthn support", async () => {
      mockBrowserSupportsWebAuthn.mockReturnValue(true);
      mockPlatformAuthenticatorIsAvailable.mockResolvedValue(true);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.supportsPasskeys).toBe(true);
      expect(result.current.hasPlatformAuthenticator).toBe(true);
    });

    it("should detect lack of WebAuthn support", async () => {
      mockBrowserSupportsWebAuthn.mockReturnValue(false);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.supportsPasskeys).toBe(false);
    });
  });

  describe("registerPasskey", () => {
    const mockRegistrationOptions = {
      challenge: "test-challenge",
      rp: { name: "Test App", id: "localhost" },
      user: {
        id: "user-id",
        name: "test@example.com",
        displayName: "Test User",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    };

    const mockRegistrationResponse = {
      id: "credential-id",
      rawId: "raw-credential-id",
      response: {
        clientDataJSON: "client-data",
        attestationObject: "attestation",
      },
      type: "public-key",
    };

    it("should register passkey successfully", async () => {
      mockGenerateRegistrationOptions.mockResolvedValue({
        data: {
          generatePasskeyRegistrationOptions: {
            options: mockRegistrationOptions,
          },
        },
      });
      mockStartRegistration.mockResolvedValue(mockRegistrationResponse);
      mockVerifyRegistration.mockResolvedValue({
        data: { verifyPasskeyRegistration: true },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.registerPasskey(
          "test@example.com",
          "My Device",
        );
      });

      expect(success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockGenerateRegistrationOptions).toHaveBeenCalledWith({
        variables: { email: "test@example.com" },
      });
      expect(mockVerifyRegistration).toHaveBeenCalledWith({
        variables: {
          email: "test@example.com",
          response: mockRegistrationResponse,
          friendlyName: "My Device",
        },
      });
    });

    it("should fail if WebAuthn is not supported", async () => {
      mockBrowserSupportsWebAuthn.mockReturnValue(false);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.registerPasskey("test@example.com");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(
        "Passkeys are not supported in this browser",
      );
    });

    it("should handle registration options failure", async () => {
      mockGenerateRegistrationOptions.mockResolvedValue({
        data: { generatePasskeyRegistrationOptions: null },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.registerPasskey("test@example.com");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Failed to get registration options");
    });

    it("should handle NotAllowedError", async () => {
      mockGenerateRegistrationOptions.mockResolvedValue({
        data: {
          generatePasskeyRegistrationOptions: {
            options: mockRegistrationOptions,
          },
        },
      });
      mockStartRegistration.mockRejectedValue(new Error("NotAllowedError"));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.registerPasskey("test@example.com");
      });

      expect(result.current.error).toBe(
        "Passkey registration was cancelled or not allowed",
      );
    });

    it("should handle InvalidStateError", async () => {
      mockGenerateRegistrationOptions.mockResolvedValue({
        data: {
          generatePasskeyRegistrationOptions: {
            options: mockRegistrationOptions,
          },
        },
      });
      mockStartRegistration.mockRejectedValue(new Error("InvalidStateError"));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.registerPasskey("test@example.com");
      });

      expect(result.current.error).toBe("This passkey is already registered");
    });
  });

  describe("authenticateWithPasskey", () => {
    const mockAuthOptions = {
      challenge: "auth-challenge",
      rpId: "localhost",
      allowCredentials: [],
    };

    const mockAuthResponse = {
      id: "credential-id",
      rawId: "raw-credential-id",
      response: {
        clientDataJSON: "client-data",
        authenticatorData: "auth-data",
        signature: "signature",
      },
      type: "public-key",
    };

    const mockTokens = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      idToken: "id-token",
    };

    it("should authenticate with passkey successfully", async () => {
      mockGenerateAuthenticationOptions.mockResolvedValue({
        data: {
          generatePasskeyAuthenticationOptions: {
            options: mockAuthOptions,
            identifier: "session-123",
          },
        },
      });
      mockStartAuthentication.mockResolvedValue(mockAuthResponse);
      mockVerifyAuthentication.mockResolvedValue({
        data: { verifyPasskeyAuthentication: mockTokens },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let tokens: typeof mockTokens | null = null;
      await act(async () => {
        tokens =
          await result.current.authenticateWithPasskey("test@example.com");
      });

      expect(tokens).toEqual(mockTokens);
      expect(result.current.error).toBeNull();
    });

    it("should authenticate without email (discoverable credential)", async () => {
      mockGenerateAuthenticationOptions.mockResolvedValue({
        data: {
          generatePasskeyAuthenticationOptions: {
            options: mockAuthOptions,
            identifier: "session-123",
          },
        },
      });
      mockStartAuthentication.mockResolvedValue(mockAuthResponse);
      mockVerifyAuthentication.mockResolvedValue({
        data: { verifyPasskeyAuthentication: mockTokens },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let tokens: typeof mockTokens | null = null;
      await act(async () => {
        tokens = await result.current.authenticateWithPasskey();
      });

      expect(tokens).toEqual(mockTokens);
      expect(mockGenerateAuthenticationOptions).toHaveBeenCalledWith({
        variables: { email: undefined },
      });
    });

    it("should fail if WebAuthn is not supported", async () => {
      mockBrowserSupportsWebAuthn.mockReturnValue(false);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let tokens: typeof mockTokens | null = mockTokens;
      await act(async () => {
        tokens = await result.current.authenticateWithPasskey();
      });

      expect(tokens).toBeNull();
      expect(result.current.error).toBe(
        "Passkeys are not supported in this browser",
      );
    });

    it("should handle NotAllowedError", async () => {
      mockGenerateAuthenticationOptions.mockResolvedValue({
        data: {
          generatePasskeyAuthenticationOptions: {
            options: mockAuthOptions,
            identifier: "session-123",
          },
        },
      });
      mockStartAuthentication.mockRejectedValue(new Error("NotAllowedError"));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.authenticateWithPasskey();
      });

      expect(result.current.error).toBe(
        "Passkey authentication was cancelled or not allowed",
      );
    });

    it("should handle no credentials error", async () => {
      mockGenerateAuthenticationOptions.mockResolvedValue({
        data: {
          generatePasskeyAuthenticationOptions: {
            options: mockAuthOptions,
            identifier: "session-123",
          },
        },
      });
      mockStartAuthentication.mockRejectedValue(new Error("No credentials"));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.authenticateWithPasskey();
      });

      expect(result.current.error).toBe(
        "No passkey found. Please use another sign-in method.",
      );
    });
  });

  describe("deletePasskey", () => {
    it("should delete passkey successfully", async () => {
      mockDeletePasskey.mockResolvedValue({
        data: { deletePasskey: true },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.deletePasskey("credential-id-123");
      });

      expect(success).toBe(true);
      expect(mockDeletePasskey).toHaveBeenCalledWith({
        variables: { credentialId: "credential-id-123" },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("should handle delete failure", async () => {
      mockDeletePasskey.mockResolvedValue({
        data: { deletePasskey: false },
      });

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.deletePasskey("credential-id-123");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Failed to delete passkey");
    });
  });

  describe("clearError", () => {
    it("should clear error state", async () => {
      mockBrowserSupportsWebAuthn.mockReturnValue(false);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.registerPasskey("test@example.com");
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
