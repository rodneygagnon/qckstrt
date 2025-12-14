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
var SQLiteProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
/**
 * SQLite Provider (OSS, Zero Setup)
 *
 * Embedded database with zero configuration required.
 * Perfect for development and testing!
 *
 * Setup:
 * NONE! SQLite is bundled with Node.js.
 * Just specify a file path or use ':memory:' for in-memory DB.
 *
 * Pros:
 * - ZERO setup required
 * - No Docker, no server, no config
 * - Perfect for local development
 * - Fast for small-medium datasets
 * - In-memory mode for blazing fast tests
 * - Single file database (easy backup/copy)
 *
 * Cons:
 * - Not suitable for production at scale
 * - Limited concurrency
 * - No network access (local only)
 *
 * Use cases:
 * - Local development (developers love it!)
 * - Unit and integration tests
 * - Prototyping
 * - Edge deployments (with Turso/libSQL)
 * - Small-scale production (< 100K records)
 */
let SQLiteProvider = (SQLiteProvider_1 = class SQLiteProvider {
  config;
  logger = new common_1.Logger(SQLiteProvider_1.name);
  constructor(config) {
    this.config = config;
    const location =
      config.database === ":memory:" ? "in-memory" : config.database;
    this.logger.log(`SQLite provider initialized: ${location}`);
  }
  getName() {
    return "SQLite";
  }
  getType() {
    return common_2.RelationalDBType.SQLite;
  }
  getConnectionOptions(entities) {
    return {
      type: "sqlite",
      database: this.config.database,
      entities,
      synchronize: true, // Auto-create tables
      logging: false,
      // SQLite-specific options
      enableWAL: this.config.database !== ":memory:", // Write-Ahead Logging for file DBs
    };
  }
  async isAvailable() {
    // SQLite is always available (bundled with better-sqlite3)
    return true;
  }
});
exports.SQLiteProvider = SQLiteProvider;
exports.SQLiteProvider =
  SQLiteProvider =
  SQLiteProvider_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [Object])],
      SQLiteProvider,
    );
//# sourceMappingURL=sqlite.provider.js.map
