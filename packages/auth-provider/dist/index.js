"use strict";
/**
 * @qckstrt/auth-provider
 *
 * Authentication provider implementations for the QCKSTRT platform.
 * Provides pluggable authentication with Supabase Auth.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = exports.SupabaseAuthProvider = exports.AuthError = void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "AuthError", {
  enumerable: true,
  get: function () {
    return common_1.AuthError;
  },
});
// Providers
var supabase_provider_js_1 = require("./providers/supabase.provider.js");
Object.defineProperty(exports, "SupabaseAuthProvider", {
  enumerable: true,
  get: function () {
    return supabase_provider_js_1.SupabaseAuthProvider;
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
