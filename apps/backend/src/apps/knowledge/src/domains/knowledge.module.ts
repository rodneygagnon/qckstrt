import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeResolver } from './knowledge.resolver';
import { EmbeddingsModule } from 'src/providers/embeddings';
import { VectorDBModule } from 'src/providers/vectordb';
import { LLMModule } from 'src/providers/llm';

/**
 * Knowledge Module
 *
 * Provides semantic search and RAG capabilities.
 * Uses embeddings (Xenova/Ollama), vector database (ChromaDB/pgvector),
 * and LLM (Ollama) for answer generation.
 *
 * All components are self-hosted OSS for full transparency and privacy.
 */
@Module({
  imports: [EmbeddingsModule, VectorDBModule, LLMModule],
  providers: [KnowledgeService, KnowledgeResolver],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
