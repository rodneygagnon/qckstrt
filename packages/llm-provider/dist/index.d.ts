/**
 * @qckstrt/llm-provider
 *
 * LLM provider implementations for the QCKSTRT platform.
 * Currently supports Ollama for self-hosted, open-source inference.
 */
export {
  ILLMProvider,
  ChatMessage,
  GenerateOptions,
  GenerateResult,
  LLMError,
} from "@qckstrt/common";
export {
  OllamaLLMProvider,
  OllamaConfig,
} from "./providers/ollama.provider.js";
export { LLMModule } from "./llm.module.js";
//# sourceMappingURL=index.d.ts.map
