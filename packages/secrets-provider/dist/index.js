"use strict";
/**
 * @qckstrt/secrets-provider
 *
 * Secrets provider implementations for the QCKSTRT platform.
 * Provides pluggable secrets management with AWS Secrets Manager support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsModule =
  exports.AWSSecretsProvider =
  exports.SecretsError =
    void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "SecretsError", {
  enumerable: true,
  get: function () {
    return common_1.SecretsError;
  },
});
// Providers
var aws_secrets_provider_js_1 = require("./providers/aws-secrets.provider.js");
Object.defineProperty(exports, "AWSSecretsProvider", {
  enumerable: true,
  get: function () {
    return aws_secrets_provider_js_1.AWSSecretsProvider;
  },
});
// Module
var secrets_module_js_1 = require("./secrets.module.js");
Object.defineProperty(exports, "SecretsModule", {
  enumerable: true,
  get: function () {
    return secrets_module_js_1.SecretsModule;
  },
});
//# sourceMappingURL=index.js.map
