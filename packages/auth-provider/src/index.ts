/**
 * @qckstrt/auth-provider
 *
 * Authentication provider implementations for the QCKSTRT platform.
 * Provides pluggable authentication with AWS Cognito support.
 */

// Re-export types from common
export {
  IAuthProvider,
  IAuthConfig,
  IAuthResult,
  IRegisterUserInput,
  AuthError,
} from "@qckstrt/common";

// Providers
export { CognitoAuthProvider } from "./providers/cognito.provider.js";

// Module
export { AuthModule } from "./auth.module.js";
