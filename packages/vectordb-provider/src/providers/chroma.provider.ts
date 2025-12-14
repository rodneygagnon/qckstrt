import { Injectable, Logger } from "@nestjs/common";
import { ChromaClient, Collection } from "chromadb";
import {
  IVectorDBProvider,
  IVectorDocument,
  VectorDBError,
} from "@qckstrt/common";

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
@Injectable()
export class ChromaDBProvider implements IVectorDBProvider {
  private readonly logger = new Logger(ChromaDBProvider.name);
  private client: ChromaClient;
  private collection: Collection | null = null;
  private dimensions: number;

  constructor(
    private readonly chromaUrl: string,
    private readonly collectionName: string,
    dimensions: number = 384, // Default for Xenova/all-MiniLM-L6-v2
  ) {
    this.client = new ChromaClient({ path: chromaUrl });
    this.dimensions = dimensions;

    this.logger.log(
      `ChromaDB provider initialized with URL: ${chromaUrl}, collection: ${collectionName}`,
    );
  }

  getName(): string {
    return "ChromaDB";
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async initialize(): Promise<void> {
    try {
      this.logger.log(
        `Initializing ChromaDB collection: ${this.collectionName}`,
      );

      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: "Document embeddings for RAG" },
      });

      this.logger.log(
        `ChromaDB collection "${this.collectionName}" initialized successfully`,
      );
    } catch (error) {
      this.logger.error("Failed to initialize ChromaDB collection:", error);
      throw new VectorDBError(this.getName(), "initialize", error as Error);
    }
  }

  async createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean> {
    if (!this.collection) {
      throw new VectorDBError(
        this.getName(),
        "createEmbeddings",
        new Error("ChromaDB collection not initialized"),
      );
    }

    try {
      this.logger.log(
        `Creating ${embeddings.length} embeddings for document ${documentId}`,
      );

      // Prepare documents for batch insertion
      const ids: string[] = [];
      const documents: string[] = [];
      const metadatas: Array<{ source: string; userId: string }> = [];
      const embeddingVectors: number[][] = [];

      embeddings.forEach((embedding, idx) => {
        // Generate unique ID for each chunk: documentId-chunkIndex
        ids.push(`${documentId}-${idx}`);
        documents.push(content[idx]);
        metadatas.push({ source: documentId, userId });
        embeddingVectors.push(embedding);
      });

      // Add documents in batches (ChromaDB handles large batches well)
      const chunkSize = 500;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const endIdx = Math.min(i + chunkSize, ids.length);
        const chunk = {
          ids: ids.slice(i, endIdx),
          embeddings: embeddingVectors.slice(i, endIdx),
          metadatas: metadatas.slice(i, endIdx),
          documents: documents.slice(i, endIdx),
        };

        this.logger.log(
          `Adding chunk ${i / chunkSize + 1}: ${chunk.ids.length} documents`,
        );

        await this.collection.add(chunk);
      }

      this.logger.log(
        `Successfully added ${ids.length} embeddings for document ${documentId}`,
      );

      return true;
    } catch (error) {
      this.logger.error("Error creating embeddings in ChromaDB:", error);
      throw new VectorDBError(
        this.getName(),
        "createEmbeddings",
        error as Error,
      );
    }
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults: number = 5,
  ): Promise<IVectorDocument[]> {
    if (!this.collection) {
      throw new VectorDBError(
        this.getName(),
        "queryEmbeddings",
        new Error("ChromaDB collection not initialized"),
      );
    }

    try {
      this.logger.log(`Querying ChromaDB for top ${nResults} results`);

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where: { userId }, // Filter by user
      });

      // Transform results into IVectorDocument format
      const documents: IVectorDocument[] = [];

      if (
        results.ids &&
        results.ids[0] &&
        results.embeddings &&
        results.embeddings[0] &&
        results.metadatas &&
        results.metadatas[0] &&
        results.documents &&
        results.documents[0]
      ) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const embedding = results.embeddings[0][i];
          if (embedding) {
            documents.push({
              id: results.ids[0][i],
              embedding,
              metadata: results.metadatas[0][i] as {
                source: string;
                userId: string;
              },
              content: results.documents[0][i] as string,
            });
          }
        }
      }

      this.logger.log(`Found ${documents.length} matching documents`);
      return documents;
    } catch (error) {
      this.logger.error("Error querying embeddings from ChromaDB:", error);
      throw new VectorDBError(
        this.getName(),
        "queryEmbeddings",
        error as Error,
      );
    }
  }

  async deleteEmbeddingsByDocumentId(documentId: string): Promise<void> {
    if (!this.collection) {
      throw new VectorDBError(
        this.getName(),
        "deleteEmbeddingsByDocumentId",
        new Error("ChromaDB collection not initialized"),
      );
    }

    try {
      this.logger.log(`Deleting embeddings for document ${documentId}`);

      // Delete all chunks for a given document (source metadata)
      await this.collection.delete({
        where: { source: documentId },
      });

      this.logger.log(`Deleted embeddings for document ${documentId}`);
    } catch (error) {
      this.logger.error("Error deleting embeddings from ChromaDB:", error);
      throw new VectorDBError(
        this.getName(),
        "deleteEmbeddingsByDocumentId",
        error as Error,
      );
    }
  }

  async deleteEmbeddingById(id: string): Promise<void> {
    if (!this.collection) {
      throw new VectorDBError(
        this.getName(),
        "deleteEmbeddingById",
        new Error("ChromaDB collection not initialized"),
      );
    }

    try {
      this.logger.log(`Deleting embedding ${id}`);

      await this.collection.delete({ ids: [id] });

      this.logger.log(`Deleted embedding ${id}`);
    } catch (error) {
      this.logger.error("Error deleting embedding from ChromaDB:", error);
      throw new VectorDBError(
        this.getName(),
        "deleteEmbeddingById",
        error as Error,
      );
    }
  }
}
