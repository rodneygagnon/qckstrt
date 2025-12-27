import { renderHook, act } from "@testing-library/react";
import { useMagicLink } from "@/lib/hooks/useMagicLink";

// Mock Apollo Client
const mockSendMagicLinkMutation = jest.fn();
const mockVerifyMagicLinkMutation = jest.fn();
const mockRegisterWithMagicLinkMutation = jest.fn();

jest.mock("@apollo/client/react", () => ({
  useMutation: jest.fn((mutation) => {
    const mutationName = mutation?.definitions?.[0]?.name?.value;
    if (mutationName === "SendMagicLink") {
      return [mockSendMagicLinkMutation, { loading: false }];
    }
    if (mutationName === "VerifyMagicLink") {
      return [mockVerifyMagicLinkMutation, { loading: false }];
    }
    if (mutationName === "RegisterWithMagicLink") {
      return [mockRegisterWithMagicLinkMutation, { loading: false }];
    }
    return [jest.fn(), { loading: false }];
  }),
}));

describe("useMagicLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMagicLinkMutation.mockReset();
    mockVerifyMagicLinkMutation.mockReset();
    mockRegisterWithMagicLinkMutation.mockReset();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useMagicLink());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.emailSent).toBe(false);
    });
  });

  describe("sendMagicLink", () => {
    it("should send magic link successfully", async () => {
      mockSendMagicLinkMutation.mockResolvedValue({
        data: { sendMagicLink: true },
      });

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.sendMagicLink("test@example.com");
      });

      expect(success).toBe(true);
      expect(result.current.emailSent).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockSendMagicLinkMutation).toHaveBeenCalledWith({
        variables: {
          input: { email: "test@example.com", redirectTo: undefined },
        },
      });
    });

    it("should send magic link with redirect URL", async () => {
      mockSendMagicLinkMutation.mockResolvedValue({
        data: { sendMagicLink: true },
      });

      const { result } = renderHook(() => useMagicLink());

      await act(async () => {
        await result.current.sendMagicLink(
          "test@example.com",
          "/auth/callback",
        );
      });

      expect(mockSendMagicLinkMutation).toHaveBeenCalledWith({
        variables: {
          input: { email: "test@example.com", redirectTo: "/auth/callback" },
        },
      });
    });

    it("should handle sendMagicLink failure", async () => {
      mockSendMagicLinkMutation.mockResolvedValue({
        data: { sendMagicLink: false },
      });

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.sendMagicLink("test@example.com");
      });

      expect(success).toBe(false);
      expect(result.current.emailSent).toBe(false);
      expect(result.current.error).toBe("Failed to send magic link");
    });

    it("should handle sendMagicLink error", async () => {
      mockSendMagicLinkMutation.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.sendMagicLink("test@example.com");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Network error");
    });
  });

  describe("verifyMagicLink", () => {
    const mockTokens = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      idToken: "id-token-789",
    };

    it("should verify magic link successfully", async () => {
      mockVerifyMagicLinkMutation.mockResolvedValue({
        data: { verifyMagicLink: mockTokens },
      });

      const { result } = renderHook(() => useMagicLink());

      let tokens: typeof mockTokens | null = null;
      await act(async () => {
        tokens = await result.current.verifyMagicLink(
          "test@example.com",
          "magic-token",
        );
      });

      expect(tokens).toEqual(mockTokens);
      expect(result.current.error).toBeNull();
      expect(mockVerifyMagicLinkMutation).toHaveBeenCalledWith({
        variables: {
          input: { email: "test@example.com", token: "magic-token" },
        },
      });
    });

    it("should handle invalid token", async () => {
      mockVerifyMagicLinkMutation.mockResolvedValue({
        data: { verifyMagicLink: null },
      });

      const { result } = renderHook(() => useMagicLink());

      let tokens = mockTokens;
      await act(async () => {
        tokens = await result.current.verifyMagicLink(
          "test@example.com",
          "invalid-token",
        );
      });

      expect(tokens).toBeNull();
      expect(result.current.error).toBe("Invalid or expired magic link");
    });

    it("should handle verification error", async () => {
      mockVerifyMagicLinkMutation.mockRejectedValue(new Error("Token expired"));

      const { result } = renderHook(() => useMagicLink());

      let tokens = mockTokens;
      await act(async () => {
        tokens = await result.current.verifyMagicLink(
          "test@example.com",
          "expired-token",
        );
      });

      expect(tokens).toBeNull();
      expect(result.current.error).toBe("Token expired");
    });
  });

  describe("registerWithMagicLink", () => {
    it("should register with magic link successfully", async () => {
      mockRegisterWithMagicLinkMutation.mockResolvedValue({
        data: { registerWithMagicLink: true },
      });

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.registerWithMagicLink("new@example.com");
      });

      expect(success).toBe(true);
      expect(result.current.emailSent).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should handle registration failure", async () => {
      mockRegisterWithMagicLinkMutation.mockResolvedValue({
        data: { registerWithMagicLink: false },
      });

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.registerWithMagicLink("new@example.com");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Failed to send registration link");
    });

    it("should handle registration error", async () => {
      mockRegisterWithMagicLinkMutation.mockRejectedValue(
        new Error("Email already exists"),
      );

      const { result } = renderHook(() => useMagicLink());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.registerWithMagicLink(
          "existing@example.com",
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Email already exists");
    });
  });

  describe("clearError", () => {
    it("should clear error state", async () => {
      mockSendMagicLinkMutation.mockRejectedValue(new Error("Test error"));

      const { result } = renderHook(() => useMagicLink());

      await act(async () => {
        await result.current.sendMagicLink("test@example.com");
      });

      expect(result.current.error).toBe("Test error");

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("resetEmailSent", () => {
    it("should reset emailSent state", async () => {
      mockSendMagicLinkMutation.mockResolvedValue({
        data: { sendMagicLink: true },
      });

      const { result } = renderHook(() => useMagicLink());

      await act(async () => {
        await result.current.sendMagicLink("test@example.com");
      });

      expect(result.current.emailSent).toBe(true);

      act(() => {
        result.current.resetEmailSent();
      });

      expect(result.current.emailSent).toBe(false);
    });
  });
});
