"use strict";
/**
 * @qckstrt/storage-provider
 *
 * Storage provider implementations for the QCKSTRT platform.
 * Provides pluggable file storage with Supabase Storage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule =
  exports.SupabaseStorageProvider =
  exports.StorageError =
    void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "StorageError", {
  enumerable: true,
  get: function () {
    return common_1.StorageError;
  },
});
// Providers
var supabase_provider_js_1 = require("./providers/supabase.provider.js");
Object.defineProperty(exports, "SupabaseStorageProvider", {
  enumerable: true,
  get: function () {
    return supabase_provider_js_1.SupabaseStorageProvider;
  },
});
// Module
var storage_module_js_1 = require("./storage.module.js");
Object.defineProperty(exports, "StorageModule", {
  enumerable: true,
  get: function () {
    return storage_module_js_1.StorageModule;
  },
});
//# sourceMappingURL=index.js.map
