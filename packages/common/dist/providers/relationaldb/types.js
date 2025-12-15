"use strict";
/**
 * Relational Database Types and Interfaces
 *
 * Strategy Pattern for relational database connections.
 * Uses PostgreSQL via Supabase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalDBError = exports.RelationalDBType = void 0;
/**
 * Database types supported
 */
var RelationalDBType;
(function (RelationalDBType) {
  RelationalDBType["PostgreSQL"] = "postgres";
})(RelationalDBType || (exports.RelationalDBType = RelationalDBType = {}));
/**
 * Exception thrown when relational DB operations fail
 */
class RelationalDBError extends Error {
  provider;
  originalError;
  constructor(provider, originalError) {
    super(`Relational DB error in ${provider}: ${originalError.message}`);
    this.provider = provider;
    this.originalError = originalError;
    this.name = "RelationalDBError";
  }
}
exports.RelationalDBError = RelationalDBError;
//# sourceMappingURL=types.js.map
