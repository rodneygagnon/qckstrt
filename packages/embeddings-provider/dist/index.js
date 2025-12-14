"use strict";
/**
 * @qckstrt/embeddings-provider
 *
 * Embeddings provider implementations for the QCKSTRT platform.
 * Supports Xenova (in-process) and Ollama (local server) providers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsModule =
  exports.EmbeddingsService =
  exports.OllamaEmbeddingProvider =
  exports.XenovaEmbeddingProvider =
  exports.EmbeddingError =
    void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "EmbeddingError", {
  enumerable: true,
  get: function () {
    return common_1.EmbeddingError;
  },
});
// Provider implementations
var xenova_provider_js_1 = require("./providers/xenova.provider.js");
Object.defineProperty(exports, "XenovaEmbeddingProvider", {
  enumerable: true,
  get: function () {
    return xenova_provider_js_1.XenovaEmbeddingProvider;
  },
});
var ollama_provider_js_1 = require("./providers/ollama.provider.js");
Object.defineProperty(exports, "OllamaEmbeddingProvider", {
  enumerable: true,
  get: function () {
    return ollama_provider_js_1.OllamaEmbeddingProvider;
  },
});
// Service and module
var embeddings_service_js_1 = require("./embeddings.service.js");
Object.defineProperty(exports, "EmbeddingsService", {
  enumerable: true,
  get: function () {
    return embeddings_service_js_1.EmbeddingsService;
  },
});
var embeddings_module_js_1 = require("./embeddings.module.js");
Object.defineProperty(exports, "EmbeddingsModule", {
  enumerable: true,
  get: function () {
    return embeddings_module_js_1.EmbeddingsModule;
  },
});
//# sourceMappingURL=index.js.map
