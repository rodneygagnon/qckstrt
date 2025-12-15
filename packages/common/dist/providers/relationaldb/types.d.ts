/**
 * Relational Database Types and Interfaces
 *
 * Strategy Pattern for relational database connections.
 * Uses PostgreSQL via Supabase.
 */
import { DataSourceOptions } from "typeorm";
/**
 * Database types supported
 */
export declare enum RelationalDBType {
  PostgreSQL = "postgres",
}
/**
 * Strategy interface for relational database providers
 */
export interface IRelationalDBProvider {
  /**
   * Get the provider name for logging
   */
  getName(): string;
  /**
   * Get the database type
   */
  getType(): RelationalDBType;
  /**
   * Get TypeORM connection options for this provider
   */
  getConnectionOptions(
    entities: DataSourceOptions["entities"],
  ): DataSourceOptions;
  /**
   * Check if provider is available (for development warnings)
   */
  isAvailable(): Promise<boolean>;
}
/**
 * Exception thrown when relational DB operations fail
 */
export declare class RelationalDBError extends Error {
  provider: string;
  originalError: Error;
  constructor(provider: string, originalError: Error);
}
//# sourceMappingURL=types.d.ts.map
