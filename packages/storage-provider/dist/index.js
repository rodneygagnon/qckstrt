"use strict";
/**
 * @qckstrt/storage-provider
 *
 * Storage provider implementations for the QCKSTRT platform.
 * Provides pluggable file storage with AWS S3 support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule =
  exports.S3StorageProvider =
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
var s3_provider_js_1 = require("./providers/s3.provider.js");
Object.defineProperty(exports, "S3StorageProvider", {
  enumerable: true,
  get: function () {
    return s3_provider_js_1.S3StorageProvider;
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
