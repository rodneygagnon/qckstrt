"use strict";
/**
 * @qckstrt/llm-provider
 *
 * LLM provider implementations for the QCKSTRT platform.
 * Currently supports Ollama for self-hosted, open-source inference.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModule = exports.OllamaLLMProvider = exports.LLMError = void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "LLMError", {
  enumerable: true,
  get: function () {
    return common_1.LLMError;
  },
});
// Provider implementations
var ollama_provider_js_1 = require("./providers/ollama.provider.js");
Object.defineProperty(exports, "OllamaLLMProvider", {
  enumerable: true,
  get: function () {
    return ollama_provider_js_1.OllamaLLMProvider;
  },
});
// NestJS module
var llm_module_js_1 = require("./llm.module.js");
Object.defineProperty(exports, "LLMModule", {
  enumerable: true,
  get: function () {
    return llm_module_js_1.LLMModule;
  },
});
//# sourceMappingURL=index.js.map
