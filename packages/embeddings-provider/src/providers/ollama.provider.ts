import { Injectable, Logger } from "@nestjs/common";
import { IEmbeddingProvider, EmbeddingError } from "@qckstrt/common";

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
@Injectable()
export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  private readonly logger = new Logger(OllamaEmbeddingProvider.name);
  private baseUrl: string;
  private model: string;
  private dimensions: number;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || "http://localhost:11434";
    this.model = model || "nomic-embed-text";
    // nomic-embed-text: 768 dimensions
    // mxbai-embed-large: 1024 dimensions
    this.dimensions = model === "mxbai-embed-large" ? 1024 : 768;

    this.logger.log(
      `Initialized Ollama embeddings at ${this.baseUrl} with model: ${this.model}`,
    );
  }

  getName(): string {
    return "Ollama";
  }

  getModelName(): string {
    return this.model;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      this.logger.log(`Embedding ${texts.length} documents with Ollama`);

      const embeddings: number[][] = [];

      // Ollama doesn't have batch API, process one by one
      for (const text of texts) {
        const embedding = await this.embed(text);
        embeddings.push(embedding);
      }

      return embeddings;
    } catch (error) {
      this.logger.error("Ollama embedding failed:", error);
      throw new EmbeddingError(this.getName(), error as Error);
    }
  }

  async embedQuery(query: string): Promise<number[]> {
    try {
      this.logger.log("Embedding query with Ollama");
      return await this.embed(query);
    } catch (error) {
      this.logger.error("Ollama query embedding failed:", error);
      throw new EmbeddingError(this.getName(), error as Error);
    }
  }

  private async embed(text: string): Promise<number[]> {
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

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }
}
