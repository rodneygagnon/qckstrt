"use strict";
/**
 * Storage Provider Types
 *
 * Interfaces for file storage operations (S3, local filesystem, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageError = void 0;
/**
 * Storage error class
 */
class StorageError extends Error {
  code;
  cause;
  constructor(message, code, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "StorageError";
  }
}
exports.StorageError = StorageError;
//# sourceMappingURL=types.js.map
