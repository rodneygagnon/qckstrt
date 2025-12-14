import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVectorDBProvider, IVectorDocument, VectorDBError } from '../types';

/**
 * Vector Embedding Entity for pgvector
 *
 * This entity stores vector embeddings in PostgreSQL using the pgvector extension.
 * pgvector adds vector similarity search to PostgreSQL.
 */
export class VectorEmbedding {
  id: string; // Format: {documentId}-{chunkIndex}
  userId: string;
  documentId: string; // Source document
  embedding: string; // Stored as text representation of vector
  content: string;
  createdAt: Date;
}

/**
 * pgvector Provider (OSS, PostgreSQL Extension)
 *
 * Uses PostgreSQL with pgvector extension for vector storage.
 * This consolidates relational + vector data into a single database!
 *
 * Setup:
 * 1. Install pgvector extension in PostgreSQL:
 *    CREATE EXTENSION vector;
 * 2. Create vector table (see migrations)
 * 3. Use existing PostgreSQL connection
 *
 * Pros:
 * - Consolidates relational + vector into one database
 * - ACID transactions across relational + vector data
 * - No separate service required
 * - Cost savings (one database instead of two)
 * - Lower latency (no network hop between DBs)
 *
 * Cons:
 * - Slower than specialized vector DBs for huge scale
 * - Limited to PostgreSQL ecosystem
 *
 * Performance:
 * - Excellent for < 1M vectors
 * - Use HNSW indexes for fast similarity search
 * - Supports cosine, L2, and inner product distance
 */
@Injectable()
export class PgVectorProvider implements IVectorDBProvider {
  private readonly logger = new Logger(PgVectorProvider.name);
  private dimensions: number;
  private initialized = false;

  constructor(
    @InjectRepository(VectorEmbedding)
    private readonly vectorRepo: Repository<VectorEmbedding>,
    dimensions: number = 384, // Default for Xenova/all-MiniLM-L6-v2
  ) {
    this.dimensions = dimensions;

    this.logger.log(
      `pgvector provider initialized with ${dimensions} dimensions`,
    );
  }

  getName(): string {
    return 'pgvector';
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async initialize(): Promise<void> {
    try {
      this.logger.log('Initializing pgvector provider');

      // Ensure pgvector extension is installed
      await this.vectorRepo.query(`
        CREATE EXTENSION IF NOT EXISTS vector;
      `);

      // Create table if it doesn't exist
      await this.vectorRepo.query(`
        CREATE TABLE IF NOT EXISTS vector_embeddings (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          document_id VARCHAR(255) NOT NULL,
          embedding vector(${this.dimensions}) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          -- Indexes for fast querying
          INDEX idx_user_id (user_id),
          INDEX idx_document_id (document_id)
        );
      `);

      // Create HNSW index for fast vector similarity search
      // This is much faster than sequential scan for large datasets
      await this.vectorRepo.query(`
        CREATE INDEX IF NOT EXISTS idx_embedding_hnsw
        ON vector_embeddings
        USING hnsw (embedding vector_cosine_ops);
      `);

      this.initialized = true;
      this.logger.log('pgvector provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize pgvector:', error);
      throw new VectorDBError(this.getName(), 'initialize', error as Error);
    }
  }

  async createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      this.logger.log(
        `Creating ${embeddings.length} embeddings for document ${documentId}`,
      );

      // Prepare batch insert
      const values = embeddings.map((embedding, idx) => {
        const id = `${documentId}-${idx}`;
        const vectorStr = `[${embedding.join(',')}]`;
        return `('${id}', '${userId}', '${documentId}', '${vectorStr}', '${this.escapeString(content[idx])}', CURRENT_TIMESTAMP)`;
      });

      // Batch insert for performance
      const batchSize = 100;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        await this.vectorRepo.query(`
          INSERT INTO vector_embeddings (id, user_id, document_id, embedding, content, created_at)
          VALUES ${batch.join(', ')}
          ON CONFLICT (id) DO UPDATE
          SET embedding = EXCLUDED.embedding,
              content = EXCLUDED.content,
              created_at = CURRENT_TIMESTAMP;
        `);

        this.logger.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(values.length / batchSize)}`,
        );
      }

      this.logger.log(
        `Successfully created ${embeddings.length} embeddings for document ${documentId}`,
      );

      return true;
    } catch (error) {
      this.logger.error('Error creating embeddings in pgvector:', error);
      throw new VectorDBError(
        this.getName(),
        'createEmbeddings',
        error as Error,
      );
    }
  }

  async queryEmbeddings(
    queryEmbedding: number[],
    userId: string,
    nResults: number = 5,
  ): Promise<IVectorDocument[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      this.logger.log(`Querying pgvector for top ${nResults} results`);

      const queryVectorStr = `[${queryEmbedding.join(',')}]`;

      // Use cosine similarity for semantic search
      // 1 - cosine distance = cosine similarity
      const results = await this.vectorRepo.query(`
        SELECT
          id,
          user_id,
          document_id,
          embedding::text,
          content,
          1 - (embedding <=> '${queryVectorStr}'::vector) as similarity
        FROM vector_embeddings
        WHERE user_id = '${userId}'
        ORDER BY embedding <=> '${queryVectorStr}'::vector
        LIMIT ${nResults};
      `);

      // Transform to IVectorDocument format
      const documents: IVectorDocument[] = results.map((row: any) => ({
        id: row.id,
        embedding: this.parseVector(row.embedding),
        metadata: {
          source: row.document_id,
          userId: row.user_id,
          similarity: parseFloat(row.similarity),
        },
        content: row.content,
      }));

      this.logger.log(`Found ${documents.length} matching documents`);
      return documents;
    } catch (error) {
      this.logger.error('Error querying embeddings from pgvector:', error);
      throw new VectorDBError(
        this.getName(),
        'queryEmbeddings',
        error as Error,
      );
    }
  }

  async deleteEmbeddingsByDocumentId(documentId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      this.logger.log(`Deleting embeddings for document ${documentId}`);

      await this.vectorRepo.query(`
        DELETE FROM vector_embeddings
        WHERE document_id = '${documentId}';
      `);

      this.logger.log(`Deleted embeddings for document ${documentId}`);
    } catch (error) {
      this.logger.error('Error deleting embeddings from pgvector:', error);
      throw new VectorDBError(
        this.getName(),
        'deleteEmbeddingsByDocumentId',
        error as Error,
      );
    }
  }

  async deleteEmbeddingById(id: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      this.logger.log(`Deleting embedding ${id}`);

      await this.vectorRepo.query(`
        DELETE FROM vector_embeddings
        WHERE id = '${id}';
      `);

      this.logger.log(`Deleted embedding ${id}`);
    } catch (error) {
      this.logger.error('Error deleting embedding from pgvector:', error);
      throw new VectorDBError(
        this.getName(),
        'deleteEmbeddingById',
        error as Error,
      );
    }
  }

  /**
   * Helper: Parse PostgreSQL vector string to number array
   */
  private parseVector(vectorStr: string): number[] {
    // Format: "[1.0,2.0,3.0]"
    return vectorStr
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map((v) => parseFloat(v));
  }

  /**
   * Helper: Escape string for SQL
   */
  private escapeString(str: string): string {
    return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
  }
}
