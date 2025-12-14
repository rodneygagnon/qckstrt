"use strict";
/**
 * Vector Database Types and Interfaces
 *
 * Strategy Pattern for vector database operations.
 * Supports swapping between ChromaDB, pgvector, Qdrant, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDBError = void 0;
/**
 * Exception thrown when vector DB operations fail
 */
class VectorDBError extends Error {
  provider;
  operation;
  originalError;
  constructor(provider, operation, originalError) {
    super(
      `Vector DB operation '${operation}' failed in ${provider}: ${originalError.message}`,
    );
    this.provider = provider;
    this.operation = operation;
    this.originalError = originalError;
    this.name = "VectorDBError";
  }
}
exports.VectorDBError = VectorDBError;
//# sourceMappingURL=types.js.map
