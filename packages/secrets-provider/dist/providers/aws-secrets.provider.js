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
var AWSSecretsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSSecretsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const common_2 = require("@qckstrt/common");
/**
 * AWS Secrets Manager Provider
 *
 * Implements secrets retrieval using AWS Secrets Manager.
 */
let AWSSecretsProvider = (AWSSecretsProvider_1 = class AWSSecretsProvider {
  configService;
  logger = new common_1.Logger(AWSSecretsProvider_1.name, {
    timestamp: true,
  });
  client;
  config;
  constructor(configService) {
    this.configService = configService;
    const region = configService.get("region") || "us-east-1";
    this.config = { region };
    this.client = new client_secrets_manager_1.SecretsManagerClient({ region });
    this.logger.log(`AWSSecretsProvider initialized for region: ${region}`);
  }
  getName() {
    return "AWSSecretsProvider";
  }
  async getSecret(secretId) {
    try {
      const command = new client_secrets_manager_1.GetSecretValueCommand({
        SecretId: secretId,
      });
      const response = await this.client.send(command);
      this.logger.log(`Retrieved secret: ${secretId}`);
      return response.SecretString;
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        this.logger.warn(`Secret not found: ${secretId}`);
        return undefined;
      }
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
exports.AWSSecretsProvider = AWSSecretsProvider;
exports.AWSSecretsProvider =
  AWSSecretsProvider =
  AWSSecretsProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      AWSSecretsProvider,
    );
//# sourceMappingURL=aws-secrets.provider.js.map
