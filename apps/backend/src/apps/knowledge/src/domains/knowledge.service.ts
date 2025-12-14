/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EmbeddingsService } from 'src/providers/embeddings';
import { IVectorDBProvider } from 'src/providers/vectordb';
import { ILLMProvider } from 'src/providers/llm';

/**
 * Knowledge Service
 *
 * Handles semantic search and RAG (Retrieval-Augmented Generation) operations.
 * Uses pluggable providers for vector database and LLM.
 */
@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name, {
    timestamp: true,
  });

  constructor(
    @Inject() private embeddingsService: EmbeddingsService,
    @Inject('VECTOR_DB_PROVIDER') private vectorDB: IVectorDBProvider,
    @Inject('LLM_PROVIDER') private llm: ILLMProvider,
  ) {
    this.logger.log(
      `KnowledgeService initialized with vector DB: ${this.vectorDB.getName()}, LLM: ${this.llm.getName()}/${this.llm.getModelName()}`,
    );
  }

  /**
   * Store document embeddings in vector database
   */
  async indexDocument(
    userId: string,
    documentId: string,
    text: string,
  ): Promise<void> {
    this.logger.log(
      `Indexing document ${documentId} for user ${userId} (${text.length} chars)`,
    );

    try {
      // Generate embeddings for the document
      const result = await this.embeddingsService.getEmbeddingsForText(text);

      // Store in vector database (using injected provider)
      await this.vectorDB.createEmbeddings(
        userId,
        documentId,
        result.embeddings,
        result.texts,
      );

      this.logger.log(
        `Indexed ${result.texts.length} chunks for document ${documentId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to index document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Answer a query using RAG (Retrieval-Augmented Generation)
   *
   * Process:
   * 1. Perform semantic search to retrieve relevant context
   * 2. Build prompt with context and user query
   * 3. Generate answer using LLM
   */
  async answerQuery(userId: string, query: string): Promise<string> {
    try {
      // Step 1: Retrieve relevant context via semantic search
      const contextChunks = await this.semanticSearch(userId, query, 3);

      this.logger.log(
        `Retrieved ${contextChunks.length} context chunks for RAG`,
      );

      if (contextChunks.length === 0) {
        return 'I could not find any relevant information to answer your question.';
      }

      // Step 2: Build RAG prompt with context
      const context = contextChunks.join('\n\n');
      const prompt = this.buildRAGPrompt(context, query);

      this.logger.log(
        `Generating answer with ${this.llm.getName()}/${this.llm.getModelName()}`,
      );

      // Step 3: Generate answer with LLM
      const result = await this.llm.generate(prompt, {
        maxTokens: 500,
        temperature: 0.7,
        topP: 0.95,
      });

      this.logger.log(
        `Generated answer: ${result.text.length} chars (${result.tokensUsed || 'unknown'} tokens)`,
      );

      return result.text;
    } catch (error) {
      this.logger.error('RAG answer generation failed:', error);
      throw error;
    }
  }

  /**
   * Build RAG prompt with context and query
   */
  private buildRAGPrompt(context: string, query: string): string {
    return `You are a helpful assistant. Answer the question based on the context provided below.

Context:
${context}

Question: ${query}

Answer:`;
  }

  /**
   * Search for relevant text chunks
   */
  async searchText(
    userId: string,
    query: string,
    count: number = 3,
  ): Promise<string[]> {
    const texts = await this.semanticSearch(userId, query, count);

    this.logger.log(`Found ${texts.length} relevant chunks`);

    return texts;
  }

  /**
   * Perform semantic search using embeddings
   */
  private async semanticSearch(
    userId: string,
    query: string,
    count: number = 3,
  ): Promise<string[]> {
    try {
      // Get query embedding
      const queryEmbedding =
        await this.embeddingsService.getEmbeddingsForQuery(query);

      // Query vector database for similar documents
      const results = await this.vectorDB.queryEmbeddings(
        queryEmbedding,
        userId,
        count,
      );

      this.logger.log(`Semantic search returned ${results.length} results`);

      // Extract text content from results
      return results.map((result) => result.content);
    } catch (error) {
      this.logger.error('Error in semantic search:', error);
      return [];
    }
  }

  /**
   * Delete document embeddings from vector database
   */
  async deleteDocumentEmbeddings(
    userId: string,
    documentId: string,
  ): Promise<void> {
    this.logger.log(`Deleting embeddings for document ${documentId}`);

    try {
      await this.vectorDB.deleteEmbeddingsByDocumentId(documentId);
      this.logger.log(`Deleted embeddings for document ${documentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete embeddings for document ${documentId}:`,
        error,
      );
      throw error;
    }
  }
}
