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
var XenovaEmbeddingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XenovaEmbeddingProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
/**
 * Xenova Embedding Provider (OSS, In-Process)
 *
 * Uses Xenova/Transformers.js for fully in-process embedding generation.
 * No external services required - runs entirely in Node.js.
 *
 * Models: Xenova/all-MiniLM-L6-v2, Xenova/bge-small-en-v1.5, etc.
 *
 * Setup:
 * 1. npm install @xenova/transformers
 * 2. First run will download model (~25MB for all-MiniLM-L6-v2)
 * 3. Models are cached locally for subsequent runs
 *
 * Advantages:
 * - No external services needed (unlike Ollama)
 * - Fast inference for small batches
 * - Models auto-download and cache
 * - Cross-platform (works anywhere Node.js runs)
 *
 * Trade-offs:
 * - Slower than GPU-accelerated Ollama for large batches
 * - Limited to ONNX-compatible models
 * - Higher memory usage (model loaded in-process)
 */
let XenovaEmbeddingProvider =
  (XenovaEmbeddingProvider_1 = class XenovaEmbeddingProvider {
    logger = new common_1.Logger(XenovaEmbeddingProvider_1.name);
    model;
    dimensions;
    pipeline;
    initialized = false;
    constructor(model) {
      // Default to all-MiniLM-L6-v2 (384 dimensions, ~25MB, great for general use)
      this.model = model || "Xenova/all-MiniLM-L6-v2";
      // Set dimensions based on model
      // Common models:
      // - Xenova/all-MiniLM-L6-v2: 384 dimensions
      // - Xenova/bge-small-en-v1.5: 384 dimensions
      // - Xenova/all-mpnet-base-v2: 768 dimensions
      this.dimensions = this.getDimensionsForModel(this.model);
      this.logger.log(
        `Initializing Xenova embeddings with model: ${this.model} (${this.dimensions}d)`,
      );
    }
    getDimensionsForModel(model) {
      if (model.includes("mpnet-base")) return 768;
      if (model.includes("MiniLM-L6")) return 384;
      if (model.includes("bge-small")) return 384;
      if (model.includes("bge-base")) return 768;
      return 384; // Default
    }
    async ensureInitialized() {
      if (this.initialized) return;
      try {
        this.logger.log("Loading Transformers.js pipeline...");
        // Dynamic import to avoid bundling issues
        const { pipeline } = await import("@xenova/transformers");
        // Initialize the feature extraction pipeline
        // On first run, this will download the model
        this.pipeline = await pipeline("feature-extraction", this.model);
        this.initialized = true;
        this.logger.log("Xenova pipeline initialized successfully");
      } catch (error) {
        this.logger.error("Failed to initialize Xenova pipeline:", error);
        throw new Error(
          `Xenova initialization failed: ${error.message}. Ensure @xenova/transformers is installed.`,
        );
      }
    }
    getName() {
      return "Xenova";
    }
    getModelName() {
      return this.model;
    }
    getDimensions() {
      return this.dimensions;
    }
    async embedDocuments(texts) {
      try {
        await this.ensureInitialized();
        this.logger.log(`Embedding ${texts.length} documents with Xenova`);
        const embeddings = [];
        // Process in batches for better performance
        const batchSize = 32;
        for (let i = 0; i < texts.length; i += batchSize) {
          const batch = texts.slice(i, i + batchSize);
          for (const text of batch) {
            const embedding = await this.embed(text);
            embeddings.push(embedding);
          }
          if (i + batchSize < texts.length) {
            this.logger.log(
              `Embedded ${i + batch.length}/${texts.length} documents`,
            );
          }
        }
        this.logger.log(`Successfully embedded ${texts.length} documents`);
        return embeddings;
      } catch (error) {
        this.logger.error("Xenova document embedding failed:", error);
        throw new common_2.EmbeddingError(this.getName(), error);
      }
    }
    async embedQuery(query) {
      try {
        await this.ensureInitialized();
        this.logger.log("Embedding query with Xenova");
        return await this.embed(query);
      } catch (error) {
        this.logger.error("Xenova query embedding failed:", error);
        throw new common_2.EmbeddingError(this.getName(), error);
      }
    }
    async embed(text) {
      // Generate embedding using the pipeline
      const pipelineFn = this.pipeline;
      const output = await pipelineFn(text, {
        pooling: "mean", // Mean pooling
        normalize: true, // L2 normalization
      });
      // Convert to regular array
      const embedding = Array.from(output.data);
      return embedding;
    }
  });
exports.XenovaEmbeddingProvider = XenovaEmbeddingProvider;
exports.XenovaEmbeddingProvider =
  XenovaEmbeddingProvider =
  XenovaEmbeddingProvider_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [String])],
      XenovaEmbeddingProvider,
    );
//# sourceMappingURL=xenova.provider.js.map
