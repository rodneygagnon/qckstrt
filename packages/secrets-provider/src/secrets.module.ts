import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AWSSecretsProvider } from "./providers/aws-secrets.provider.js";

/**
 * Secrets Module
 *
 * Provides secrets management capabilities using pluggable providers.
 * Currently supports AWS Secrets Manager.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AWSSecretsProvider,
    {
      provide: "SECRETS_PROVIDER",
      useExisting: AWSSecretsProvider,
    },
  ],
  exports: [AWSSecretsProvider, "SECRETS_PROVIDER"],
})
export class SecretsModule {}
