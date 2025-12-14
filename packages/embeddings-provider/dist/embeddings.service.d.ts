import {
  IEmbeddingProvider,
  EmbeddingResult,
  ChunkingConfig,
} from "@qckstrt/common";
/**
 * Embeddings Service
 *
 * Uses Dependency Injection to receive an embedding provider.
 * Provider can be swapped (OpenAI, Ollama, etc.) via DI configuration.
 */
export declare class EmbeddingsService {
  private readonly provider;
  private readonly chunkingConfig;
  private readonly logger;
  private textSplitter;
  constructor(provider: IEmbeddingProvider, chunkingConfig: ChunkingConfig);
  /**
   * Generate embeddings for a document
   * Handles chunking automatically
   */
  getEmbeddingsForText(text: string): Promise<EmbeddingResult>;
  /**
   * Generate embedding for a query
   */
  getEmbeddingsForQuery(query: string): Promise<number[]>;
  /**
   * Get provider information
   */
  getProviderInfo(): {
    name: string;
    model: string;
    dimensions: number;
    chunkSize: number;
    chunkOverlap: number;
  };
}
//# sourceMappingURL=embeddings.service.d.ts.map
