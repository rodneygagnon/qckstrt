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
const supabase_vault_provider_js_1 = require("./providers/supabase-vault.provider.js");
/**
 * Secrets Module
 *
 * Provides secrets management capabilities using pluggable providers.
 *
 * Configure via SECRETS_PROVIDER environment variable:
 * - 'supabase' (default): Supabase Vault
 */
let SecretsModule = class SecretsModule {};
exports.SecretsModule = SecretsModule;
exports.SecretsModule = SecretsModule = __decorate(
  [
    (0, common_1.Global)(),
    (0, common_1.Module)({
      imports: [config_1.ConfigModule],
      providers: [
        {
          provide: "SECRETS_PROVIDER",
          useFactory: (configService) => {
            const provider =
              configService.get("secrets.provider") || "supabase";
            switch (provider.toLowerCase()) {
              case "supabase":
              default:
                return new supabase_vault_provider_js_1.SupabaseVaultProvider(
                  configService,
                );
            }
          },
          inject: [config_1.ConfigService],
        },
      ],
      exports: ["SECRETS_PROVIDER"],
    }),
  ],
  SecretsModule,
);
//# sourceMappingURL=secrets.module.js.map
