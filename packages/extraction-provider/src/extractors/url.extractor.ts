import { Injectable, Logger } from "@nestjs/common";
import {
  ITextExtractor,
  TextExtractionInput,
  TextExtractionResult,
  ExtractionError,
} from "@qckstrt/common";

/**
 * URL Text Extractor (OSS Implementation)
 *
 * Extracts text from web pages using simple HTTP fetching.
 * For production, consider using:
 * - Firecrawl (https://firecrawl.dev)
 * - Jina Reader (https://jina.ai/reader)
 * - Playwright for JS-heavy sites
 */
@Injectable()
export class URLExtractor implements ITextExtractor {
  private readonly logger = new Logger(URLExtractor.name);

  getName(): string {
    return "URLExtractor";
  }

  supports(input: TextExtractionInput): boolean {
    return input.type === "url";
  }

  async extractText(input: TextExtractionInput): Promise<TextExtractionResult> {
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
      throw new ExtractionError(this.getName(), error as Error);
    }
  }
}
