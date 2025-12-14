/**
 * Auth Provider Types
 *
 * Interfaces for authentication operations (Cognito, Auth0, etc.)
 */

/**
 * Authentication result with tokens
 */
export interface IAuthResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn?: number;
}

/**
 * User registration input
 */
export interface IRegisterUserInput {
  email: string;
  username: string;
  password: string;
  attributes?: Record<string, string>;
}

/**
 * Auth provider configuration
 */
export interface IAuthConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
}

/**
 * Auth provider interface
 */
export interface IAuthProvider {
  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Register a new user
   */
  registerUser(input: IRegisterUserInput): Promise<string>;

  /**
   * Authenticate user with credentials
   */
  authenticateUser(email: string, password: string): Promise<IAuthResult>;

  /**
   * Confirm user registration (admin)
   */
  confirmUser(username: string): Promise<void>;

  /**
   * Delete a user
   */
  deleteUser(username: string): Promise<boolean>;

  /**
   * Add user to a group/role
   */
  addToGroup(username: string, group: string): Promise<void>;

  /**
   * Remove user from a group/role
   */
  removeFromGroup(username: string, group: string): Promise<void>;

  /**
   * Change user password
   */
  changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;

  /**
   * Initiate forgot password flow
   */
  forgotPassword(username: string): Promise<boolean>;

  /**
   * Confirm forgot password with code
   */
  confirmForgotPassword(
    username: string,
    password: string,
    confirmationCode: string,
  ): Promise<boolean>;
}

/**
 * Auth error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
