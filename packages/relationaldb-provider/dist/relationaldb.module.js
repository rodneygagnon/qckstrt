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
const aurora_provider_js_1 = require("./providers/aurora.provider.js");
const sqlite_provider_js_1 = require("./providers/sqlite.provider.js");
/**
 * Relational Database Module
 *
 * Configures Dependency Injection for relational database providers.
 *
 * To swap providers, change the RELATIONAL_DB_PROVIDER factory:
 * - sqlite (default for development, zero setup!)
 * - postgres (production, local or cloud)
 * - aurora (AWS Aurora Serverless)
 * - Add your own implementation of IRelationalDBProvider
 */
let RelationalDBModule = class RelationalDBModule {};
exports.RelationalDBModule = RelationalDBModule;
exports.RelationalDBModule = RelationalDBModule = __decorate(
  [
    (0, common_1.Module)({
      providers: [
        // Relational DB provider selection
        {
          provide: "RELATIONAL_DB_PROVIDER",
          useFactory: (configService) => {
            // Check if we're in development/test mode
            const nodeEnv = configService.get("NODE_ENV") || "development";
            // Default to SQLite for development (zero setup!)
            const provider =
              configService.get("relationaldb.provider") ||
              (nodeEnv === "production" ? "postgres" : "sqlite");
            let dbProvider;
            switch (provider.toLowerCase()) {
              case "postgres":
              case "postgresql":
                // OSS: PostgreSQL (production standard)
                const postgresConfig = {
                  host:
                    configService.get("relationaldb.postgres.host") ||
                    "localhost",
                  port: configService.get("relationaldb.postgres.port") || 5432,
                  database:
                    configService.get("relationaldb.postgres.database") ||
                    "qckstrt",
                  username:
                    configService.get("relationaldb.postgres.username") ||
                    "postgres",
                  password:
                    configService.get("relationaldb.postgres.password") ||
                    "postgres",
                  ssl: configService.get("relationaldb.postgres.ssl") || false,
                };
                dbProvider = new postgres_provider_js_1.PostgresProvider(
                  postgresConfig,
                );
                break;
              case "aurora":
              case "aurora-postgres":
                // AWS: Aurora Serverless
                const auroraConfig = {
                  database:
                    configService.get("relationaldb.aurora.database") ||
                    "qckstrt",
                  secretArn:
                    configService.get("relationaldb.aurora.secretArn") || "",
                  resourceArn:
                    configService.get("relationaldb.aurora.resourceArn") || "",
                  region:
                    configService.get("AWS_REGION") ||
                    configService.get("region") ||
                    "us-east-1",
                };
                dbProvider = new aurora_provider_js_1.AuroraProvider(
                  auroraConfig,
                );
                break;
              case "sqlite":
              default:
                // OSS: SQLite (development/testing - zero setup!)
                const sqliteConfig = {
                  database:
                    configService.get("relationaldb.sqlite.database") ||
                    (nodeEnv === "test" ? ":memory:" : "./data/dev.sqlite"),
                };
                dbProvider = new sqlite_provider_js_1.SQLiteProvider(
                  sqliteConfig,
                );
                break;
            }
            return dbProvider;
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
