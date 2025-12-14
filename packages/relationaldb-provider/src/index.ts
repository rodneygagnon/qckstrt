/**
 * Relational Database Provider Package
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports multiple OSS providers: SQLite (default dev), PostgreSQL, Aurora
 */

// Re-export types from common
export {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from "@qckstrt/common";

// Provider implementations
export * from "./providers/postgres.provider.js";
export * from "./providers/aurora.provider.js";
export * from "./providers/sqlite.provider.js";

// NestJS Module
export * from "./relationaldb.module.js";
