/**
 * @qckstrt/secrets-provider
 *
 * Secrets provider implementations for the QCKSTRT platform.
 * Provides pluggable secrets management with Supabase Vault.
 */

// Re-export types from common
export {
  ISecretsProvider,
  ISecretsConfig,
  SecretsError,
} from "@qckstrt/common";

// Providers
export { SupabaseVaultProvider } from "./providers/supabase-vault.provider.js";

// Module
export { SecretsModule } from "./secrets.module.js";
