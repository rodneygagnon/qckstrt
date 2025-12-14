import {
  ILLMProvider,
  ChatMessage,
  GenerateOptions,
  GenerateResult,
} from "@qckstrt/common";
/**
 * Ollama configuration
 */
export interface OllamaConfig {
  url: string;
  model: string;
}
/**
 * Ollama LLM Provider (OSS, Local)
 *
 * Uses Ollama for local LLM inference with full privacy.
 * Runs models entirely on your machine with GPU acceleration.
 *
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull a model: ollama pull llama3.2
 * 3. Run server: ollama serve (default port 11434)
 *
 * Recommended Models:
 * - llama3.2 (3B) - Fast, good quality, runs on laptop
 * - mistral (7B) - Excellent quality, moderate speed
 * - falcon (7B) - Alternative to Mistral
 * - llama3.1 (8B) - Latest Llama, great performance
 *
 * Pros:
 * - 100% local (no API calls, full privacy)
 * - GPU acceleration (fast on decent hardware)
 * - Free (no API costs)
 * - Many models available
 * - Native streaming support
 *
 * Cons:
 * - Requires local GPU for good performance
 * - Need to download models (GBs)
 * - Slower than cloud APIs on CPU-only
 */
export declare class OllamaLLMProvider implements ILLMProvider {
  private readonly config;
  private readonly logger;
  constructor(config: OllamaConfig);
  getName(): string;
  getModelName(): string;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  generateStream(
    prompt: string,
    options?: GenerateOptions,
  ): AsyncGenerator<string, void, unknown>;
  chat(
    messages: ChatMessage[],
    options?: GenerateOptions,
  ): Promise<GenerateResult>;
  isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=ollama.provider.d.ts.map
