/**
 * Relational Database Types and Interfaces
 *
 * Strategy Pattern for relational database connections.
 * Supports swapping between PostgreSQL, SQLite, Aurora, etc.
 */

import { DataSourceOptions } from 'typeorm';

/**
 * Database types supported
 */
export enum RelationalDBType {
  PostgreSQL = 'postgres',
  SQLite = 'sqlite',
  AuroraPostgreSQL = 'aurora-postgres',
  MySQL = 'mysql',
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
    entities: DataSourceOptions['entities'],
  ): DataSourceOptions;

  /**
   * Check if provider is available (for development warnings)
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Exception thrown when relational DB operations fail
 */
export class RelationalDBError extends Error {
  constructor(
    public provider: string,
    public originalError: Error,
  ) {
    super(`Relational DB error in ${provider}: ${originalError.message}`);
    this.name = 'RelationalDBError';
  }
}
