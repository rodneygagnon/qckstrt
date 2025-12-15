import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ISecretsProvider } from "@qckstrt/common";
import { SupabaseVaultProvider } from "./providers/supabase-vault.provider.js";

/**
 * Secrets Module
 *
 * Provides secrets management capabilities using pluggable providers.
 *
 * Configure via SECRETS_PROVIDER environment variable:
 * - 'supabase' (default): Supabase Vault
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "SECRETS_PROVIDER",
      useFactory: (configService: ConfigService): ISecretsProvider => {
        const provider =
          configService.get<string>("secrets.provider") || "supabase";

        switch (provider.toLowerCase()) {
          case "supabase":
          default:
            return new SupabaseVaultProvider(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ["SECRETS_PROVIDER"],
})
export class SecretsModule {}
