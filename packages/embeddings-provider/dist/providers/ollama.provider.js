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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var OllamaEmbeddingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaEmbeddingProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
/**
 * Ollama Embedding Provider (OSS)
 *
 * Uses Ollama for local embedding generation.
 * Models: nomic-embed-text, mxbai-embed-large, etc.
 *
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull model: ollama pull nomic-embed-text
 * 3. Run: ollama serve (default port 11434)
 */
let OllamaEmbeddingProvider =
  (OllamaEmbeddingProvider_1 = class OllamaEmbeddingProvider {
    logger = new common_1.Logger(OllamaEmbeddingProvider_1.name);
    baseUrl;
    model;
    dimensions;
    constructor(baseUrl, model) {
      this.baseUrl = baseUrl || "http://localhost:11434";
      this.model = model || "nomic-embed-text";
      // nomic-embed-text: 768 dimensions
      // mxbai-embed-large: 1024 dimensions
      this.dimensions = model === "mxbai-embed-large" ? 1024 : 768;
      this.logger.log(
        `Initialized Ollama embeddings at ${this.baseUrl} with model: ${this.model}`,
      );
    }
    getName() {
      return "Ollama";
    }
    getModelName() {
      return this.model;
    }
    getDimensions() {
      return this.dimensions;
    }
    async embedDocuments(texts) {
      try {
        this.logger.log(`Embedding ${texts.length} documents with Ollama`);
        const embeddings = [];
        // Ollama doesn't have batch API, process one by one
        for (const text of texts) {
          const embedding = await this.embed(text);
          embeddings.push(embedding);
        }
        return embeddings;
      } catch (error) {
        this.logger.error("Ollama embedding failed:", error);
        throw new common_2.EmbeddingError(this.getName(), error);
      }
    }
    async embedQuery(query) {
      try {
        this.logger.log("Embedding query with Ollama");
        return await this.embed(query);
      } catch (error) {
        this.logger.error("Ollama query embedding failed:", error);
        throw new common_2.EmbeddingError(this.getName(), error);
      }
    }
    async embed(text) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      return data.embedding;
    }
  });
exports.OllamaEmbeddingProvider = OllamaEmbeddingProvider;
exports.OllamaEmbeddingProvider =
  OllamaEmbeddingProvider =
  OllamaEmbeddingProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [String, String]),
      ],
      OllamaEmbeddingProvider,
    );
//# sourceMappingURL=ollama.provider.js.map
