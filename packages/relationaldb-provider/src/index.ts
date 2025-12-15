/**
 * Relational Database Provider Package
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports PostgreSQL (via Supabase).
 */

// Re-export types from common
export {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from "@qckstrt/common";

// Provider implementations
export * from "./providers/postgres.provider.js";

// NestJS Module
export * from "./relationaldb.module.js";
