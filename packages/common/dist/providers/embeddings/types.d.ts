/**
 * Embeddings Types and Interfaces
 *
 * Strategy Pattern for embedding generation.
 * Supports swapping between OpenAI, Ollama, FastEmbed, etc.
 */
/**
 * Configuration for text chunking
 */
export interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
}
/**
 * Result of embedding generation
 */
export interface EmbeddingResult {
  texts: string[];
  embeddings: number[][];
  model: string;
  dimensions: number;
}
/**
 * Strategy interface for embedding providers
 */
export interface IEmbeddingProvider {
  /**
   * Generate embeddings for multiple text chunks
   */
  embedDocuments(texts: string[]): Promise<number[][]>;
  /**
   * Generate embedding for a single query
   */
  embedQuery(query: string): Promise<number[]>;
  /**
   * Get the model name
   */
  getModelName(): string;
  /**
   * Get embedding dimensions
   */
  getDimensions(): number;
  /**
   * Provider name for logging
   */
  getName(): string;
}
/**
 * Exception thrown when embedding fails
 */
export declare class EmbeddingError extends Error {
  provider: string;
  originalError: Error;
  constructor(provider: string, originalError: Error);
}
//# sourceMappingURL=types.d.ts.map
