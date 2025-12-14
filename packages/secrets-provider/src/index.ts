/**
 * @qckstrt/secrets-provider
 *
 * Secrets provider implementations for the QCKSTRT platform.
 * Provides pluggable secrets management with AWS Secrets Manager support.
 */

// Re-export types from common
export {
  ISecretsProvider,
  ISecretsConfig,
  SecretsError,
} from "@qckstrt/common";

// Providers
export {
  AWSSecretsProvider,
  getSecrets,
} from "./providers/aws-secrets.provider.js";

// Module
export { SecretsModule } from "./secrets.module.js";
