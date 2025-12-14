import { DataSourceOptions } from "typeorm";
import { IRelationalDBProvider, RelationalDBType } from "@qckstrt/common";
/**
 * SQLite configuration
 */
export interface SQLiteConfig {
  database: string;
}
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
export declare class SQLiteProvider implements IRelationalDBProvider {
  private readonly config;
  private readonly logger;
  constructor(config: SQLiteConfig);
  getName(): string;
  getType(): RelationalDBType;
  getConnectionOptions(
    entities: DataSourceOptions["entities"],
  ): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=sqlite.provider.d.ts.map
