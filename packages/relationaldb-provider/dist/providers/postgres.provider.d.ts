import { DataSourceOptions } from "typeorm";
import { IRelationalDBProvider, RelationalDBType } from "@qckstrt/common";
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
export declare class PostgresProvider implements IRelationalDBProvider {
  private readonly config;
  private readonly logger;
  constructor(config: PostgresConfig);
  getName(): string;
  getType(): RelationalDBType;
  getConnectionOptions(
    entities: DataSourceOptions["entities"],
  ): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=postgres.provider.d.ts.map
