import { IVectorDBProvider, IVectorDocument } from "@qckstrt/common";
/**
 * ChromaDB Vector Database Provider (OSS)
 *
 * Uses ChromaDB for vector storage and similarity search.
 * ChromaDB is a Python-based vector database optimized for embeddings.
 *
 * Setup:
 * 1. Install ChromaDB: pip install chromadb
 * 2. Run server: chroma run --path ./chroma_data
 * 3. Default endpoint: http://localhost:8000
 *
 * Pros:
 * - Easy to set up and use
 * - Good for development and small-medium scale
 * - Built-in persistence
 *
 * Cons:
 * - Python-based (requires separate service)
 * - Not as fast as Qdrant for large scale
 * - Limited production features
 */
export declare class ChromaDBProvider implements IVectorDBProvider {
  private readonly chromaUrl;
  private readonly collectionName;
  private readonly logger;
  private client;
  private collection;
  private dimensions;
  constructor(chromaUrl: string, collectionName: string, dimensions?: number);
  getName(): string;
  getDimensions(): number;
  initialize(): Promise<void>;
  createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean>;
  queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults?: number,
  ): Promise<IVectorDocument[]>;
  deleteEmbeddingsByDocumentId(documentId: string): Promise<void>;
  deleteEmbeddingById(id: string): Promise<void>;
}
//# sourceMappingURL=chroma.provider.d.ts.map
