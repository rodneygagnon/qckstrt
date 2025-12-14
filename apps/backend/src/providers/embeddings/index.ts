/**
 * Embeddings Module
 *
 * Strategy Pattern + Dependency Injection for embedding generation.
 * Supports multiple OSS providers: Xenova (default), Ollama
 */

export * from './types';
export * from './embeddings.service';
export * from './embeddings.module';
export * from './providers/ollama.provider';
export * from './providers/xenova.provider';
