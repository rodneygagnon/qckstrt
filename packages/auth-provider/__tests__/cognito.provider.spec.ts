/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from "@nestjs/config";
import { CognitoAuthProvider } from "../src/providers/cognito.provider";
import { AuthError } from "@qckstrt/common";

// Mock the AWS SDK
const mockSend = jest.fn();
jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  SignUpCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "SignUp" })),
  InitiateAuthCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "InitiateAuth" })),
  AdminConfirmSignUpCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "AdminConfirmSignUp" })),
  AdminDeleteUserCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "AdminDeleteUser" })),
  AdminAddUserToGroupCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "AdminAddUserToGroup" })),
  AdminRemoveUserFromGroupCommand: jest.fn().mockImplementation((input) => ({
    input,
    type: "AdminRemoveUserFromGroup",
  })),
  ChangePasswordCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "ChangePassword" })),
  ForgotPasswordCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "ForgotPassword" })),
  ConfirmForgotPasswordCommand: jest
    .fn()
    .mockImplementation((input) => ({ input, type: "ConfirmForgotPassword" })),
  AuthFlowType: {
    USER_PASSWORD_AUTH: "USER_PASSWORD_AUTH",
  },
}));

describe("CognitoAuthProvider", () => {
  let provider: CognitoAuthProvider;
  let configService: ConfigService;

  const createConfigService = (
    overrides: Record<string, string | undefined> = {},
  ) => {
    const config: Record<string, string | undefined> = {
      region: "us-east-1",
      "auth.userPoolId": "us-east-1_testpool",
      "auth.clientId": "test-client-id",
      ...overrides,
    };
    return {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = createConfigService();
    provider = new CognitoAuthProvider(configService);
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider).toBeDefined();
      expect(provider.getName()).toBe("CognitoAuthProvider");
    });

    it("should throw AuthError when config is missing", () => {
      const badConfig = createConfigService({
        "auth.userPoolId": undefined,
        "auth.clientId": undefined,
      });

      expect(() => new CognitoAuthProvider(badConfig)).toThrow(AuthError);
    });
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      mockSend.mockResolvedValue({ UserSub: "user-123" });

      const result = await provider.registerUser({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
      });

      expect(result).toBe("user-123");
    });

    it("should register user with custom attributes", async () => {
      mockSend.mockResolvedValue({ UserSub: "user-123" });

      const result = await provider.registerUser({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        attributes: {
          department: "Engineering",
          "custom:clearance": "Top Secret",
        },
      });

      expect(result).toBe("user-123");
    });

    it("should return unknown when UserSub is missing", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.registerUser({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
      });

      expect(result).toBe("unknown");
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Cognito error"));

      await expect(
        provider.registerUser({
          email: "test@example.com",
          username: "testuser",
          password: "Password123!",
        }),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate user successfully", async () => {
      mockSend.mockResolvedValue({
        AuthenticationResult: {
          AccessToken: "access-token",
          IdToken: "id-token",
          RefreshToken: "refresh-token",
          ExpiresIn: 3600,
        },
      });

      const result = await provider.authenticateUser(
        "test@example.com",
        "Password123!",
      );

      expect(result).toEqual({
        accessToken: "access-token",
        idToken: "id-token",
        refreshToken: "refresh-token",
        expiresIn: 3600,
      });
    });

    it("should handle missing auth result", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.authenticateUser(
        "test@example.com",
        "Password123!",
      );

      expect(result).toEqual({
        accessToken: "",
        idToken: "",
        refreshToken: "",
        expiresIn: undefined,
      });
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Auth failed"));

      await expect(
        provider.authenticateUser("test@example.com", "wrong-password"),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("confirmUser", () => {
    it("should confirm user successfully", async () => {
      mockSend.mockResolvedValue({});

      await expect(provider.confirmUser("testuser")).resolves.toBeUndefined();
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Confirm failed"));

      await expect(provider.confirmUser("testuser")).rejects.toThrow(AuthError);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.deleteUser("testuser");

      expect(result).toBe(true);
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Delete failed"));

      await expect(provider.deleteUser("testuser")).rejects.toThrow(AuthError);
    });
  });

  describe("addToGroup", () => {
    it("should add user to group successfully", async () => {
      mockSend.mockResolvedValue({});

      await expect(
        provider.addToGroup("testuser", "admin"),
      ).resolves.toBeUndefined();
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Add to group failed"));

      await expect(provider.addToGroup("testuser", "admin")).rejects.toThrow(
        AuthError,
      );
    });
  });

  describe("removeFromGroup", () => {
    it("should remove user from group successfully", async () => {
      mockSend.mockResolvedValue({});

      await expect(
        provider.removeFromGroup("testuser", "admin"),
      ).resolves.toBeUndefined();
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Remove from group failed"));

      await expect(
        provider.removeFromGroup("testuser", "admin"),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.changePassword(
        "access-token",
        "OldPass123!",
        "NewPass123!",
      );

      expect(result).toBe(true);
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Change password failed"));

      await expect(
        provider.changePassword("access-token", "OldPass123!", "NewPass123!"),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("forgotPassword", () => {
    it("should initiate forgot password successfully", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.forgotPassword("testuser");

      expect(result).toBe(true);
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Forgot password failed"));

      await expect(provider.forgotPassword("testuser")).rejects.toThrow(
        AuthError,
      );
    });
  });

  describe("confirmForgotPassword", () => {
    it("should confirm forgot password successfully", async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.confirmForgotPassword(
        "testuser",
        "NewPass123!",
        "123456",
      );

      expect(result).toBe(true);
    });

    it("should throw AuthError on failure", async () => {
      mockSend.mockRejectedValue(new Error("Confirm forgot password failed"));

      await expect(
        provider.confirmForgotPassword("testuser", "NewPass123!", "123456"),
      ).rejects.toThrow(AuthError);
    });
  });
});
