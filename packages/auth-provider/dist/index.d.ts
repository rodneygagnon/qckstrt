/**
 * @qckstrt/auth-provider
 *
 * Authentication provider implementations for the QCKSTRT platform.
 * Provides pluggable authentication with Supabase Auth.
 */
export {
  IAuthProvider,
  IAuthConfig,
  IAuthResult,
  IRegisterUserInput,
  AuthError,
} from "@qckstrt/common";
export { SupabaseAuthProvider } from "./providers/supabase.provider.js";
export { AuthModule } from "./auth.module.js";
//# sourceMappingURL=index.d.ts.map
