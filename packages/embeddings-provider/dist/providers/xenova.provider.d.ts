import { IEmbeddingProvider } from "@qckstrt/common";
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
export declare class XenovaEmbeddingProvider implements IEmbeddingProvider {
  private readonly logger;
  private model;
  private dimensions;
  private pipeline;
  private initialized;
  constructor(model?: string);
  private getDimensionsForModel;
  private ensureInitialized;
  getName(): string;
  getModelName(): string;
  getDimensions(): number;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(query: string): Promise<number[]>;
  private embed;
}
//# sourceMappingURL=xenova.provider.d.ts.map
