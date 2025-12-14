import { Injectable, Logger } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from '../types';

/**
 * SQLite configuration
 */
export interface SQLiteConfig {
  database: string; // File path or ':memory:'
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
@Injectable()
export class SQLiteProvider implements IRelationalDBProvider {
  private readonly logger = new Logger(SQLiteProvider.name);

  constructor(private readonly config: SQLiteConfig) {
    const location =
      config.database === ':memory:' ? 'in-memory' : config.database;
    this.logger.log(`SQLite provider initialized: ${location}`);
  }

  getName(): string {
    return 'SQLite';
  }

  getType(): RelationalDBType {
    return RelationalDBType.SQLite;
  }

  getConnectionOptions(
    entities: DataSourceOptions['entities'],
  ): DataSourceOptions {
    return {
      type: 'sqlite',
      database: this.config.database,
      entities,
      synchronize: true, // Auto-create tables
      logging: false,
      // SQLite-specific options
      enableWAL: this.config.database !== ':memory:', // Write-Ahead Logging for file DBs
    } as DataSourceOptions;
  }

  async isAvailable(): Promise<boolean> {
    // SQLite is always available (bundled with better-sqlite3)
    return true;
  }
}
