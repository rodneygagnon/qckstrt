"use strict";
/**
 * LLM (Language Model) Types and Interfaces
 *
 * Strategy Pattern for language model inference.
 * Supports swapping between Falcon, Ollama, llama.cpp, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMError = void 0;
/**
 * Exception thrown when LLM operations fail
 */
class LLMError extends Error {
  provider;
  operation;
  originalError;
  constructor(provider, operation, originalError) {
    super(
      `LLM operation '${operation}' failed in ${provider}: ${originalError.message}`,
    );
    this.provider = provider;
    this.operation = operation;
    this.originalError = originalError;
    this.name = "LLMError";
  }
}
exports.LLMError = LLMError;
//# sourceMappingURL=types.js.map
