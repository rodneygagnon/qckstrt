import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeResolver } from './knowledge.resolver';
import { EmbeddingsModule } from '@qckstrt/embeddings-provider';
import { VectorDBModule } from '@qckstrt/vectordb-provider';
import { LLMModule } from '@qckstrt/llm-provider';

/**
 * Knowledge Module
 *
 * Provides semantic search and RAG capabilities.
 * Uses embeddings (Xenova/Ollama), vector database (pgvector on PostgreSQL),
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
