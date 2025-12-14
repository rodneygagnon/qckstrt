/**
 * Relational Database Provider Package
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports multiple OSS providers: SQLite (default dev), PostgreSQL, Aurora
 */
export {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from "@qckstrt/common";
export * from "./providers/postgres.provider.js";
export * from "./providers/aurora.provider.js";
export * from "./providers/sqlite.provider.js";
export * from "./relationaldb.module.js";
//# sourceMappingURL=index.d.ts.map
