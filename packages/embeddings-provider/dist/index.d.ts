/**
 * @qckstrt/embeddings-provider
 *
 * Embeddings provider implementations for the QCKSTRT platform.
 * Supports Xenova (in-process) and Ollama (local server) providers.
 */
export {
  IEmbeddingProvider,
  ChunkingConfig,
  EmbeddingResult,
  EmbeddingError,
} from "@qckstrt/common";
export { XenovaEmbeddingProvider } from "./providers/xenova.provider.js";
export { OllamaEmbeddingProvider } from "./providers/ollama.provider.js";
export { EmbeddingsService } from "./embeddings.service.js";
export { EmbeddingsModule } from "./embeddings.module.js";
//# sourceMappingURL=index.d.ts.map
