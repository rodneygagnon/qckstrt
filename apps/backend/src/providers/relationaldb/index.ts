/**
 * Relational Database Module
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports multiple OSS providers: SQLite (default dev), PostgreSQL, Aurora
 */

export * from './types';
export * from './relationaldb.module';
export * from './providers/postgres.provider';
export * from './providers/aurora.provider';
export * from './providers/sqlite.provider';
