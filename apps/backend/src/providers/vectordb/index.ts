/**
 * Vector Database Module
 *
 * Strategy Pattern + Dependency Injection for vector database operations.
 * Supports multiple OSS providers: ChromaDB (default), pgvector (coming soon)
 */

export * from './types';
export * from './vectordb.module';
export * from './providers/chroma.provider';
export * from './providers/pgvector.provider';
