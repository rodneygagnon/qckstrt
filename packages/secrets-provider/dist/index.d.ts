/**
 * @qckstrt/secrets-provider
 *
 * Secrets provider implementations for the QCKSTRT platform.
 * Provides pluggable secrets management with Supabase Vault.
 */
export {
  ISecretsProvider,
  ISecretsConfig,
  SecretsError,
} from "@qckstrt/common";
export { SupabaseVaultProvider } from "./providers/supabase-vault.provider.js";
export { SecretsModule } from "./secrets.module.js";
//# sourceMappingURL=index.d.ts.map
