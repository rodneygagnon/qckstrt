"use strict";
/**
 * @qckstrt/vector-provider
 *
 * Vector database provider implementations for the QCKSTRT platform.
 * Currently supports ChromaDB for self-hosted vector storage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDBModule =
  exports.ChromaDBProvider =
  exports.VectorDBError =
    void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "VectorDBError", {
  enumerable: true,
  get: function () {
    return common_1.VectorDBError;
  },
});
// Provider implementations
var chroma_provider_js_1 = require("./providers/chroma.provider.js");
Object.defineProperty(exports, "ChromaDBProvider", {
  enumerable: true,
  get: function () {
    return chroma_provider_js_1.ChromaDBProvider;
  },
});
// NestJS module
var vectordb_module_js_1 = require("./vectordb.module.js");
Object.defineProperty(exports, "VectorDBModule", {
  enumerable: true,
  get: function () {
    return vectordb_module_js_1.VectorDBModule;
  },
});
//# sourceMappingURL=index.js.map
