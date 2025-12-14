"use strict";
/**
 * Auth Provider Types
 *
 * Interfaces for authentication operations (Cognito, Auth0, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
/**
 * Auth error class
 */
class AuthError extends Error {
  code;
  cause;
  constructor(message, code, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "AuthError";
  }
}
exports.AuthError = AuthError;
//# sourceMappingURL=types.js.map
