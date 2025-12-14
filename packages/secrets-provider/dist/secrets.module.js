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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const aws_secrets_provider_js_1 = require("./providers/aws-secrets.provider.js");
/**
 * Secrets Module
 *
 * Provides secrets management capabilities using pluggable providers.
 * Currently supports AWS Secrets Manager.
 */
let SecretsModule = class SecretsModule {};
exports.SecretsModule = SecretsModule;
exports.SecretsModule = SecretsModule = __decorate(
  [
    (0, common_1.Global)(),
    (0, common_1.Module)({
      imports: [config_1.ConfigModule],
      providers: [
        aws_secrets_provider_js_1.AWSSecretsProvider,
        {
          provide: "SECRETS_PROVIDER",
          useExisting: aws_secrets_provider_js_1.AWSSecretsProvider,
        },
      ],
      exports: [
        aws_secrets_provider_js_1.AWSSecretsProvider,
        "SECRETS_PROVIDER",
      ],
    }),
  ],
  SecretsModule,
);
//# sourceMappingURL=secrets.module.js.map
