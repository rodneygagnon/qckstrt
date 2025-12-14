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
exports.EmbeddingsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const embeddings_service_js_1 = require("./embeddings.service.js");
const ollama_provider_js_1 = require("./providers/ollama.provider.js");
const xenova_provider_js_1 = require("./providers/xenova.provider.js");
/**
 * Embeddings Module
 *
 * Configures Dependency Injection for embedding providers.
 *
 * To swap providers, change the EMBEDDING_PROVIDER factory:
 * - Xenova (default, OSS, in-process, no external services)
 * - Ollama (OSS, local server, GPU-accelerated)
 * - Add your own implementation of IEmbeddingProvider
 */
let EmbeddingsModule = class EmbeddingsModule {};
exports.EmbeddingsModule = EmbeddingsModule;
exports.EmbeddingsModule = EmbeddingsModule = __decorate(
  [
    (0, common_1.Module)({
      providers: [
        // Chunking configuration
        {
          provide: "CHUNKING_CONFIG",
          useFactory: (configService) => ({
            chunkSize: configService.get("embeddings.chunkSize") || 1000,
            chunkOverlap: configService.get("embeddings.chunkOverlap") || 200,
          }),
          inject: [config_1.ConfigService],
        },
        // Embedding provider selection
        {
          provide: "EMBEDDING_PROVIDER",
          useFactory: (configService) => {
            const provider =
              configService.get("embeddings.provider") || "xenova";
            switch (provider.toLowerCase()) {
              case "ollama":
                // OSS: Use local Ollama server
                const ollamaUrl =
                  configService.get("embeddings.ollama.url") ||
                  "http://localhost:11434";
                const ollamaModel =
                  configService.get("embeddings.ollama.model") ||
                  "nomic-embed-text";
                return new ollama_provider_js_1.OllamaEmbeddingProvider(
                  ollamaUrl,
                  ollamaModel,
                );
              case "xenova":
              default:
                // OSS: Use Xenova/Transformers.js (default, runs in-process)
                const xenovaModel =
                  configService.get("embeddings.xenova.model") ||
                  "Xenova/all-MiniLM-L6-v2";
                return new xenova_provider_js_1.XenovaEmbeddingProvider(
                  xenovaModel,
                );
            }
          },
          inject: [config_1.ConfigService],
        },
        // Main embeddings service
        {
          provide: embeddings_service_js_1.EmbeddingsService,
          useFactory: (provider, config) => {
            return new embeddings_service_js_1.EmbeddingsService(
              provider,
              config,
            );
          },
          inject: ["EMBEDDING_PROVIDER", "CHUNKING_CONFIG"],
        },
      ],
      exports: [embeddings_service_js_1.EmbeddingsService],
    }),
  ],
  EmbeddingsModule,
);
//# sourceMappingURL=embeddings.module.js.map
