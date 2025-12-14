/**
 * LLM (Language Model) Types and Interfaces
 *
 * Strategy Pattern for language model inference.
 * Supports swapping between Falcon, Ollama, llama.cpp, etc.
 */
/**
 * Chat message for multi-turn conversations
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
/**
 * Generation options for text completion
 */
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  stream?: boolean;
}
/**
 * Generation result
 */
export interface GenerateResult {
  text: string;
  tokensUsed?: number;
  finishReason?: "stop" | "length" | "error";
}
/**
 * Strategy interface for LLM providers
 */
export interface ILLMProvider {
  /**
   * Get the provider name for logging
   */
  getName(): string;
  /**
   * Get the model name/identifier
   */
  getModelName(): string;
  /**
   * Generate text completion from a prompt
   */
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  /**
   * Stream text completion token-by-token
   * Returns an async generator that yields tokens as they're generated
   */
  generateStream(
    prompt: string,
    options?: GenerateOptions,
  ): AsyncGenerator<string, void, unknown>;
  /**
   * Chat completion for multi-turn conversations
   * Convenience method that formats messages into a prompt
   */
  chat(
    messages: ChatMessage[],
    options?: GenerateOptions,
  ): Promise<GenerateResult>;
  /**
   * Check if provider is available (for health checks)
   */
  isAvailable(): Promise<boolean>;
}
/**
 * Exception thrown when LLM operations fail
 */
export declare class LLMError extends Error {
  provider: string;
  operation: string;
  originalError: Error;
  constructor(provider: string, operation: string, originalError: Error);
}
//# sourceMappingURL=types.d.ts.map
