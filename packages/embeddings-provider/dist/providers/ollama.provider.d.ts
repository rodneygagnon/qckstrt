import { IEmbeddingProvider } from "@qckstrt/common";
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
export declare class OllamaEmbeddingProvider implements IEmbeddingProvider {
  private readonly logger;
  private baseUrl;
  private model;
  private dimensions;
  constructor(baseUrl?: string, model?: string);
  getName(): string;
  getModelName(): string;
  getDimensions(): number;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(query: string): Promise<number[]>;
  private embed;
}
//# sourceMappingURL=ollama.provider.d.ts.map
