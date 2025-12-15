import { ConfigService } from "@nestjs/config";
import { ISecretsProvider } from "@qckstrt/common";
/**
 * Supabase Vault Provider
 *
 * Implements secrets retrieval using Supabase Vault (pgsodium).
 * Provides an OSS alternative to AWS Secrets Manager.
 *
 * Prerequisites:
 * - Supabase project with Vault enabled
 * - Database function `vault_read_secret` to read from vault.decrypted_secrets
 *
 * SQL to create the function:
 * ```sql
 * CREATE OR REPLACE FUNCTION vault_read_secret(secret_name text)
 * RETURNS TABLE (decrypted_secret text)
 * LANGUAGE plpgsql SECURITY DEFINER AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT vault.decrypted_secrets.decrypted_secret
 *   FROM vault.decrypted_secrets
 *   WHERE vault.decrypted_secrets.name = secret_name;
 * END;
 * $$;
 * ```
 */
export declare class SupabaseVaultProvider implements ISecretsProvider {
  private configService;
  private readonly logger;
  private readonly supabase;
  constructor(configService: ConfigService);
  getName(): string;
  getSecret(secretId: string): Promise<string | undefined>;
  getSecrets(secretIds: string[]): Promise<Record<string, string | undefined>>;
  getSecretJson<T>(secretId: string): Promise<T | undefined>;
}
//# sourceMappingURL=supabase-vault.provider.d.ts.map
