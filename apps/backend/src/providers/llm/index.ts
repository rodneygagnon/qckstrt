/**
 * LLM (Language Model) Module
 *
 * Strategy Pattern + Dependency Injection for language model inference.
 * Provider: Ollama (self-hosted, supports any model from ollama.ai/library)
 */

export * from './types';
export * from './llm.module';
export * from './providers/ollama.provider';
