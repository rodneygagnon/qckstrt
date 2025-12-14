"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var OllamaLLMProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaLLMProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
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
let OllamaLLMProvider = (OllamaLLMProvider_1 = class OllamaLLMProvider {
  config;
  logger = new common_1.Logger(OllamaLLMProvider_1.name);
  constructor(config) {
    this.config = config;
    this.logger.log(
      `Ollama LLM provider initialized: ${config.model} at ${config.url}`,
    );
  }
  getName() {
    return "Ollama";
  }
  getModelName() {
    return this.config.model;
  }
  async generate(prompt, options) {
    try {
      this.logger.log(
        `Generating completion with Ollama/${this.config.model} (${prompt.length} chars)`,
      );
      const response = await fetch(`${this.config.url}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            num_predict: options?.maxTokens || 512,
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.95,
            top_k: options?.topK || 40,
            stop: options?.stopSequences || [],
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      this.logger.log(
        `Generated ${data.response?.length || 0} chars with Ollama`,
      );
      return {
        text: data.response || "",
        tokensUsed: data.eval_count || undefined,
        finishReason: data.done ? "stop" : "length",
      };
    } catch (error) {
      this.logger.error("Ollama generation failed:", error);
      throw new common_2.LLMError(this.getName(), "generate", error);
    }
  }
  async *generateStream(prompt, options) {
    try {
      this.logger.log(`Streaming completion with Ollama/${this.config.model}`);
      const response = await fetch(`${this.config.url}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: true,
          options: {
            num_predict: options?.maxTokens || 512,
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.95,
            top_k: options?.topK || 40,
            stop: options?.stopSequences || [],
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              yield json.response;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      this.logger.error("Ollama streaming failed:", error);
      throw new common_2.LLMError(this.getName(), "generateStream", error);
    }
  }
  async chat(messages, options) {
    try {
      this.logger.log(
        `Chat completion with Ollama/${this.config.model} (${messages.length} messages)`,
      );
      const response = await fetch(`${this.config.url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: false,
          options: {
            num_predict: options?.maxTokens || 512,
            temperature: options?.temperature || 0.7,
            top_p: options?.topP || 0.95,
            top_k: options?.topK || 40,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();
      return {
        text: data.message?.content || "",
        tokensUsed: data.eval_count || undefined,
        finishReason: data.done ? "stop" : "length",
      };
    } catch (error) {
      this.logger.error("Ollama chat failed:", error);
      throw new common_2.LLMError(this.getName(), "chat", error);
    }
  }
  async isAvailable() {
    try {
      // Check if Ollama server is running
      const response = await fetch(`${this.config.url}/api/tags`);
      return response.ok;
    } catch (error) {
      this.logger.error("Ollama availability check failed:", error);
      return false;
    }
  }
});
exports.OllamaLLMProvider = OllamaLLMProvider;
exports.OllamaLLMProvider =
  OllamaLLMProvider =
  OllamaLLMProvider_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [Object])],
      OllamaLLMProvider,
    );
//# sourceMappingURL=ollama.provider.js.map
