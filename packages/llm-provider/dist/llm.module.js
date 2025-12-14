"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ollama_provider_js_1 = require("./providers/ollama.provider.js");
/**
 * LLM Module
 *
 * Configures Dependency Injection for language model providers.
 *
 * Provider: Ollama (self-hosted, OSS, full privacy)
 *
 * Supports any Ollama model:
 * - falcon (default, 7B, TII's open-source model)
 * - llama3.2 (3B, fast and efficient)
 * - mistral (7B, excellent quality)
 * - llama3.1 (8B, latest Llama)
 * - Or any other model from ollama.ai/library
 *
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull model: ollama pull falcon
 * 3. Start server: ollama serve
 */
let LLMModule = class LLMModule {};
exports.LLMModule = LLMModule;
exports.LLMModule = LLMModule = __decorate(
  [
    (0, common_1.Module)({
      providers: [
        // LLM provider selection
        {
          provide: "LLM_PROVIDER",
          useFactory: (configService) => {
            // OSS: Self-hosted inference with Ollama
            const ollamaConfig = {
              url:
                configService.get("llm.ollama.url") ||
                configService.get("llm.url") ||
                "http://localhost:11434",
              model:
                configService.get("llm.ollama.model") ||
                configService.get("llm.model") ||
                "falcon",
            };
            return new ollama_provider_js_1.OllamaLLMProvider(ollamaConfig);
          },
          inject: [config_1.ConfigService],
        },
      ],
      exports: ["LLM_PROVIDER"],
    }),
  ],
  LLMModule,
);
//# sourceMappingURL=llm.module.js.map
