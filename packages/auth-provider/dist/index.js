"use strict";
/**
 * @qckstrt/auth-provider
 *
 * Authentication provider implementations for the QCKSTRT platform.
 * Provides pluggable authentication with AWS Cognito support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = exports.CognitoAuthProvider = exports.AuthError = void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "AuthError", {
  enumerable: true,
  get: function () {
    return common_1.AuthError;
  },
});
// Providers
var cognito_provider_js_1 = require("./providers/cognito.provider.js");
Object.defineProperty(exports, "CognitoAuthProvider", {
  enumerable: true,
  get: function () {
    return cognito_provider_js_1.CognitoAuthProvider;
  },
});
// Module
var auth_module_js_1 = require("./auth.module.js");
Object.defineProperty(exports, "AuthModule", {
  enumerable: true,
  get: function () {
    return auth_module_js_1.AuthModule;
  },
});
//# sourceMappingURL=index.js.map
