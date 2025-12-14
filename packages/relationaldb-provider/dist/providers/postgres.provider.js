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
var PostgresProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
/**
 * PostgreSQL Provider (OSS)
 *
 * Standard PostgreSQL database for relational data.
 *
 * Setup:
 * 1. Install PostgreSQL: https://www.postgresql.org/download/
 * 2. Create database: createdb qckstrt
 * 3. Configure connection in config/default.yaml
 *
 * Or use Docker:
 * docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
 *
 * Pros:
 * - Industry standard, battle-tested
 * - Rich ecosystem and extensions
 * - Excellent performance
 * - ACID compliant
 *
 * Cons:
 * - Requires server setup (unlike SQLite)
 * - More resource intensive for dev
 */
let PostgresProvider = (PostgresProvider_1 = class PostgresProvider {
  config;
  logger = new common_1.Logger(PostgresProvider_1.name);
  constructor(config) {
    this.config = config;
    this.logger.log(
      `PostgreSQL provider initialized: ${config.username}@${config.host}:${config.port}/${config.database}`,
    );
  }
  getName() {
    return "PostgreSQL";
  }
  getType() {
    return common_2.RelationalDBType.PostgreSQL;
  }
  getConnectionOptions(entities) {
    return {
      type: "postgres",
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      username: this.config.username,
      password: this.config.password,
      entities,
      synchronize: true, // Auto-create tables (disable in production!)
      logging: false,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
    };
  }
  async isAvailable() {
    try {
      // Basic availability check (could ping DB here)
      return true;
    } catch (error) {
      this.logger.error("PostgreSQL availability check failed:", error);
      return false;
    }
  }
});
exports.PostgresProvider = PostgresProvider;
exports.PostgresProvider =
  PostgresProvider =
  PostgresProvider_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [Object])],
      PostgresProvider,
    );
//# sourceMappingURL=postgres.provider.js.map
