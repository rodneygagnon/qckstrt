/**
 * Relational Database Provider Package
 *
 * Strategy Pattern + Dependency Injection for relational database connections.
 * Supports PostgreSQL (via Supabase).
 */
export {
  IRelationalDBProvider,
  RelationalDBType,
  RelationalDBError,
} from "@qckstrt/common";
export * from "./providers/postgres.provider.js";
export * from "./relationaldb.module.js";
//# sourceMappingURL=index.d.ts.map
