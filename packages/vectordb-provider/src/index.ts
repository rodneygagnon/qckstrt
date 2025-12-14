/**
 * @qckstrt/vector-provider
 *
 * Vector database provider implementations for the QCKSTRT platform.
 * Currently supports ChromaDB for self-hosted vector storage.
 */

// Re-export types from common
export {
  IVectorDBProvider,
  IVectorDocument,
  IVectorQueryResult,
  VectorDBError,
} from "@qckstrt/common";

// Provider implementations
export { ChromaDBProvider } from "./providers/chroma.provider.js";

// NestJS module
export { VectorDBModule } from "./vectordb.module.js";
