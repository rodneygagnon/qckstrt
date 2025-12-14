"use strict";
/**
 * Secrets Provider Types
 *
 * Interfaces for secrets management operations (AWS Secrets Manager, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsError = void 0;
/**
 * Secrets error class
 */
class SecretsError extends Error {
  code;
  cause;
  constructor(message, code, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "SecretsError";
  }
}
exports.SecretsError = SecretsError;
//# sourceMappingURL=types.js.map
