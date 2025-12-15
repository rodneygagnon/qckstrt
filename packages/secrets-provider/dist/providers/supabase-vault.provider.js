"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var SupabaseVaultProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseVaultProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const common_2 = require("@qckstrt/common");
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
let SupabaseVaultProvider =
  (SupabaseVaultProvider_1 = class SupabaseVaultProvider {
    configService;
    logger = new common_1.Logger(SupabaseVaultProvider_1.name, {
      timestamp: true,
    });
    supabase;
    constructor(configService) {
      this.configService = configService;
      const supabaseUrl = configService.get("supabase.url");
      const supabaseServiceKey = configService.get("supabase.serviceRoleKey");
      const supabaseAnonKey = configService.get("supabase.anonKey");
      if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
        throw new common_2.SecretsError(
          "Supabase URL and key are required",
          "CONFIG_ERROR",
        );
      }
      // Use service role key for admin operations, fall back to anon key
      const key = supabaseServiceKey || supabaseAnonKey;
      this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.logger.log(`SupabaseVaultProvider initialized for: ${supabaseUrl}`);
    }
    getName() {
      return "SupabaseVaultProvider";
    }
    async getSecret(secretId) {
      try {
        // Call the database function to read from vault.decrypted_secrets
        const { data, error } = await this.supabase.rpc("vault_read_secret", {
          secret_name: secretId,
        });
        if (error) {
          // Handle not found case
          if (
            error.message.includes("does not exist") ||
            error.code === "PGRST116"
          ) {
            this.logger.warn(`Secret not found: ${secretId}`);
            return undefined;
          }
          throw error;
        }
        // The RPC returns an array of rows
        if (!data || data.length === 0) {
          this.logger.warn(`Secret not found: ${secretId}`);
          return undefined;
        }
        this.logger.log(`Retrieved secret: ${secretId}`);
        return data[0]?.decrypted_secret;
      } catch (error) {
        this.logger.error(`Error retrieving secret: ${error.message}`);
        throw new common_2.SecretsError(
          `Failed to retrieve secret ${secretId}`,
          "GET_SECRET_ERROR",
          error,
        );
      }
    }
    async getSecrets(secretIds) {
      const results = {};
      // Fetch secrets in parallel
      const promises = secretIds.map(async (secretId) => {
        try {
          results[secretId] = await this.getSecret(secretId);
        } catch (error) {
          this.logger.error(
            `Error retrieving secret ${secretId}: ${error.message}`,
          );
          results[secretId] = undefined;
        }
      });
      await Promise.all(promises);
      return results;
    }
    async getSecretJson(secretId) {
      const secret = await this.getSecret(secretId);
      if (!secret) {
        return undefined;
      }
      try {
        return JSON.parse(secret);
      } catch (error) {
        this.logger.error(`Error parsing secret JSON: ${error.message}`);
        throw new common_2.SecretsError(
          `Failed to parse secret ${secretId} as JSON`,
          "PARSE_SECRET_ERROR",
          error,
        );
      }
    }
  });
exports.SupabaseVaultProvider = SupabaseVaultProvider;
exports.SupabaseVaultProvider =
  SupabaseVaultProvider =
  SupabaseVaultProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      SupabaseVaultProvider,
    );
//# sourceMappingURL=supabase-vault.provider.js.map
