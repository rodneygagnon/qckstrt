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
exports.RelationalDBModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const postgres_provider_js_1 = require("./providers/postgres.provider.js");
/**
 * Relational Database Module
 *
 * Configures Dependency Injection for relational database providers.
 *
 * Configure via RELATIONAL_DB_PROVIDER environment variable:
 * - postgres (default, via Supabase)
 */
let RelationalDBModule = class RelationalDBModule {};
exports.RelationalDBModule = RelationalDBModule;
exports.RelationalDBModule = RelationalDBModule = __decorate(
  [
    (0, common_1.Module)({
      providers: [
        {
          provide: "RELATIONAL_DB_PROVIDER",
          useFactory: (configService) => {
            const provider =
              configService.get("relationaldb.provider") || "postgres";
            switch (provider.toLowerCase()) {
              case "postgres":
              case "postgresql":
              default:
                const postgresConfig = {
                  host:
                    configService.get("relationaldb.postgres.host") ||
                    "localhost",
                  port: configService.get("relationaldb.postgres.port") || 5432,
                  database:
                    configService.get("relationaldb.postgres.database") ||
                    "postgres",
                  username:
                    configService.get("relationaldb.postgres.username") ||
                    "postgres",
                  password:
                    configService.get("relationaldb.postgres.password") ||
                    "postgres",
                  ssl: configService.get("relationaldb.postgres.ssl") || false,
                };
                return new postgres_provider_js_1.PostgresProvider(
                  postgresConfig,
                );
            }
          },
          inject: [config_1.ConfigService],
        },
      ],
      exports: ["RELATIONAL_DB_PROVIDER"],
    }),
  ],
  RelationalDBModule,
);
//# sourceMappingURL=relationaldb.module.js.map
