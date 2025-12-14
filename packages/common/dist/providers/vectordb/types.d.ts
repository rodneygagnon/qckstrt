/**
 * Vector Database Types and Interfaces
 *
 * Strategy Pattern for vector database operations.
 * Supports swapping between ChromaDB, pgvector, Qdrant, etc.
 */
/**
 * Vector document stored in the database
 */
export interface IVectorDocument {
  id: string;
  embedding: number[];
  metadata: {
    source: string;
    userId: string;
    [key: string]: unknown;
  };
  content: string;
}
/**
 * Query result from vector search
 */
export interface IVectorQueryResult {
  documents: IVectorDocument[];
  distances?: number[];
}
/**
 * Strategy interface for vector database providers
 */
export interface IVectorDBProvider {
  /**
   * Initialize the vector database connection
   */
  initialize(): Promise<void>;
  /**
   * Create/store embeddings for document chunks
   */
  createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean>;
  /**
   * Query similar vectors (semantic search)
   */
  queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults?: number,
  ): Promise<IVectorDocument[]>;
  /**
   * Delete all embeddings for a document
   */
  deleteEmbeddingsByDocumentId(documentId: string): Promise<void>;
  /**
   * Delete a specific embedding by ID
   */
  deleteEmbeddingById(id: string): Promise<void>;
  /**
   * Get the provider name for logging
   */
  getName(): string;
  /**
   * Get the vector dimensions supported by this provider
   */
  getDimensions(): number;
}
/**
 * Exception thrown when vector DB operations fail
 */
export declare class VectorDBError extends Error {
  provider: string;
  operation: string;
  originalError: Error;
  constructor(provider: string, operation: string, originalError: Error);
}
//# sourceMappingURL=types.d.ts.map
