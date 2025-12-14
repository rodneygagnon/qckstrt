"use strict";
/**
 * Embeddings Types and Interfaces
 *
 * Strategy Pattern for embedding generation.
 * Supports swapping between OpenAI, Ollama, FastEmbed, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingError = void 0;
/**
 * Exception thrown when embedding fails
 */
class EmbeddingError extends Error {
  provider;
  originalError;
  constructor(provider, originalError) {
    super(`Embedding failed in ${provider}: ${originalError.message}`);
    this.provider = provider;
    this.originalError = originalError;
    this.name = "EmbeddingError";
  }
}
exports.EmbeddingError = EmbeddingError;
//# sourceMappingURL=types.js.map
