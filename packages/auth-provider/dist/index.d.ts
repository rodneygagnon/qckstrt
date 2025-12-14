/**
 * @qckstrt/auth-provider
 *
 * Authentication provider implementations for the QCKSTRT platform.
 * Provides pluggable authentication with AWS Cognito support.
 */
export {
  IAuthProvider,
  IAuthConfig,
  IAuthResult,
  IRegisterUserInput,
  AuthError,
} from "@qckstrt/common";
export { CognitoAuthProvider } from "./providers/cognito.provider.js";
export { AuthModule } from "./auth.module.js";
//# sourceMappingURL=index.d.ts.map
