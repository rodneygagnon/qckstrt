import { Injectable, Logger } from '@nestjs/common';
import { DataSourceOptions } from 'typeorm';
import {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from '../types';

/**
 * PostgreSQL configuration
 */
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

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
@Injectable()
export class PostgresProvider implements IRelationalDBProvider {
  private readonly logger = new Logger(PostgresProvider.name);

  constructor(private readonly config: PostgresConfig) {
    this.logger.log(
      `PostgreSQL provider initialized: ${config.username}@${config.host}:${config.port}/${config.database}`,
    );
  }

  getName(): string {
    return 'PostgreSQL';
  }

  getType(): RelationalDBType {
    return RelationalDBType.PostgreSQL;
  }

  getConnectionOptions(
    entities: DataSourceOptions['entities'],
  ): DataSourceOptions {
    return {
      type: 'postgres',
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      username: this.config.username,
      password: this.config.password,
      entities,
      synchronize: true, // Auto-create tables (disable in production!)
      logging: false,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
    } as DataSourceOptions;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Basic availability check (could ping DB here)
      return true;
    } catch (error) {
      this.logger.error('PostgreSQL availability check failed:', error);
      return false;
    }
  }
}
