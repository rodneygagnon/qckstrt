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
  texts: string[]; // Text chunks
  embeddings: number[][]; // Vector embeddings for each chunk
  model: string; // Model used for embedding
  dimensions: number; // Vector dimensions
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
export class EmbeddingError extends Error {
  constructor(
    public provider: string,
    public originalError: Error,
  ) {
    super(`Embedding failed in ${provider}: ${originalError.message}`);
    this.name = 'EmbeddingError';
  }
}
