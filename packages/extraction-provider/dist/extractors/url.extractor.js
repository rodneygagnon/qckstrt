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
var URLExtractor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLExtractor = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
/**
 * URL Text Extractor (OSS Implementation)
 *
 * Extracts text from web pages using simple HTTP fetching.
 * For production, consider using:
 * - Firecrawl (https://firecrawl.dev)
 * - Jina Reader (https://jina.ai/reader)
 * - Playwright for JS-heavy sites
 */
let URLExtractor = (URLExtractor_1 = class URLExtractor {
  logger = new common_1.Logger(URLExtractor_1.name);
  getName() {
    return "URLExtractor";
  }
  supports(input) {
    return input.type === "url";
  }
  async extractText(input) {
    if (input.type !== "url") {
      throw new Error("URLExtractor only supports URL inputs");
    }
    this.logger.log(`Extracting text from URL: ${input.url}`);
    try {
      // Simple implementation - fetch and extract text
      // TODO: Replace with Firecrawl or similar for production
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const html = await response.text();
      // Basic HTML tag stripping (very naive - use a proper library in production)
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return {
        text,
        metadata: {
          source: input.url,
          extractedAt: new Date(),
          extractor: this.getName(),
          statusCode: response.status,
          contentType: response.headers.get("content-type") || "unknown",
        },
      };
    } catch (error) {
      this.logger.error(`Failed to extract from URL ${input.url}:`, error);
      throw new common_2.ExtractionError(this.getName(), error);
    }
  }
});
exports.URLExtractor = URLExtractor;
exports.URLExtractor =
  URLExtractor =
  URLExtractor_1 =
    __decorate([(0, common_1.Injectable)()], URLExtractor);
//# sourceMappingURL=url.extractor.js.map
