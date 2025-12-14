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
var EmbeddingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsService = void 0;
const common_1 = require("@nestjs/common");
const textsplitters_1 = require("@langchain/textsplitters");
/**
 * Embeddings Service
 *
 * Uses Dependency Injection to receive an embedding provider.
 * Provider can be swapped (OpenAI, Ollama, etc.) via DI configuration.
 */
let EmbeddingsService = (EmbeddingsService_1 = class EmbeddingsService {
  provider;
  chunkingConfig;
  logger = new common_1.Logger(EmbeddingsService_1.name);
  textSplitter;
  constructor(
    // DI: Provider is injected (OpenAI, Ollama, etc.)
    provider,
    chunkingConfig,
  ) {
    this.provider = provider;
    this.chunkingConfig = chunkingConfig;
    this.logger.log(
      `Initialized with ${provider.getName()} provider (model: ${provider.getModelName()}, dimensions: ${provider.getDimensions()})`,
    );
    this.textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
      chunkSize: chunkingConfig.chunkSize,
      chunkOverlap: chunkingConfig.chunkOverlap,
    });
  }
  /**
   * Generate embeddings for a document
   * Handles chunking automatically
   */
  async getEmbeddingsForText(text) {
    this.logger.log("Generating embeddings for document");
    // Chunk the text
    const chunks = await this.textSplitter.splitText(text);
    this.logger.log(`Split text into ${chunks.length} chunks`);
    // Generate embeddings
    const embeddings = await this.provider.embedDocuments(chunks);
    return {
      texts: chunks,
      embeddings,
      model: this.provider.getModelName(),
      dimensions: this.provider.getDimensions(),
    };
  }
  /**
   * Generate embedding for a query
   */
  async getEmbeddingsForQuery(query) {
    this.logger.log("Generating embedding for query");
    return this.provider.embedQuery(query);
  }
  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      name: this.provider.getName(),
      model: this.provider.getModelName(),
      dimensions: this.provider.getDimensions(),
      chunkSize: this.chunkingConfig.chunkSize,
      chunkOverlap: this.chunkingConfig.chunkOverlap,
    };
  }
});
exports.EmbeddingsService = EmbeddingsService;
exports.EmbeddingsService =
  EmbeddingsService =
  EmbeddingsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [Object, Object]),
      ],
      EmbeddingsService,
    );
//# sourceMappingURL=embeddings.service.js.map
