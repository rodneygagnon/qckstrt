/**
 * @qckstrt/vector-provider
 *
 * Vector database provider implementations for the QCKSTRT platform.
 * Currently supports ChromaDB for self-hosted vector storage.
 */
export {
  IVectorDBProvider,
  IVectorDocument,
  IVectorQueryResult,
  VectorDBError,
} from "@qckstrt/common";
export { ChromaDBProvider } from "./providers/chroma.provider.js";
export { VectorDBModule } from "./vectordb.module.js";
//# sourceMappingURL=index.d.ts.map
