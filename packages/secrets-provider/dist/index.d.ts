/**
 * @qckstrt/secrets-provider
 *
 * Secrets provider implementations for the QCKSTRT platform.
 * Provides pluggable secrets management with AWS Secrets Manager support.
 */
export {
  ISecretsProvider,
  ISecretsConfig,
  SecretsError,
} from "@qckstrt/common";
export { AWSSecretsProvider } from "./providers/aws-secrets.provider.js";
export { SecretsModule } from "./secrets.module.js";
//# sourceMappingURL=index.d.ts.map
