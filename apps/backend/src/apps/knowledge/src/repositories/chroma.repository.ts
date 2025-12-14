import { ChromaClient, Collection } from 'chromadb';
import { IAppConfig } from 'src/config';

export interface IChromaDocument {
  id: string;
  embedding: number[];
  metadata: { source: string; userId: string };
  document: string;
}

export class ChromaRepository {
  static #instance: ChromaRepository;

  private client: ChromaClient;
  private collection: Collection | null = null;

  public static async getInstance(config: IAppConfig) {
    if (!ChromaRepository.#instance) {
      ChromaRepository.#instance = new ChromaRepository(config);
      await ChromaRepository.#instance.initialize();
    }

    return ChromaRepository.#instance;
  }

  private constructor(private config: IAppConfig) {
    // ChromaDB client - uses HTTP to connect to the Chroma server
    // Default: http://localhost:8000
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    this.client = new ChromaClient({ path: chromaUrl });
  }

  private async initialize(): Promise<void> {
    try {
      // Get or create a collection for embeddings
      // Collection name combines project and application for multi-tenancy
      const collectionName = `${this.config.project}_embeddings`;

      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
        metadata: { description: 'Document embeddings for RAG' },
      });

      console.log(
        `ChromaDB collection "${collectionName}" initialized successfully`,
      );
    } catch (error) {
      console.error('Failed to initialize ChromaDB collection:', error);
      throw error;
    }
  }

  async createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean> {
    if (!this.collection) {
      throw new Error('ChromaDB collection not initialized');
    }

    try {
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

        console.log(
          `Adding chunk ${i / chunkSize + 1}: ${chunk.ids.length} documents`,
        );

        await this.collection.add(chunk);
      }

      console.log(
        `Successfully added ${ids.length} embeddings for document ${documentId}`,
      );

      return true;
    } catch (error) {
      console.error('Error creating embeddings in ChromaDB:', error);
      throw error;
    }
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults: number = 5,
  ): Promise<IChromaDocument[]> {
    if (!this.collection) {
      throw new Error('ChromaDB collection not initialized');
    }

    try {
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        where: { userId }, // Filter by user
      });

      // Transform results into IChromaDocument format
      const documents: IChromaDocument[] = [];

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
              document: results.documents[0][i] as string,
            });
          }
        }
      }

      return documents;
    } catch (error) {
      console.error('Error querying embeddings from ChromaDB:', error);
      throw error;
    }
  }

  async deleteEmbeddingsByDocumentId(documentId: string): Promise<void> {
    if (!this.collection) {
      throw new Error('ChromaDB collection not initialized');
    }

    try {
      // Delete all chunks for a given document (source metadata)
      await this.collection.delete({
        where: { source: documentId },
      });

      console.log(`Deleted embeddings for document ${documentId}`);
    } catch (error) {
      console.error('Error deleting embeddings from ChromaDB:', error);
      throw error;
    }
  }

  async deleteEmbeddingById(id: string): Promise<void> {
    if (!this.collection) {
      throw new Error('ChromaDB collection not initialized');
    }

    try {
      await this.collection.delete({ ids: [id] });
      console.log(`Deleted embedding ${id}`);
    } catch (error) {
      console.error('Error deleting embedding from ChromaDB:', error);
      throw error;
    }
  }
}
