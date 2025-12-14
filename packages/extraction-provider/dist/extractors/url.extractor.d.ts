import {
  ITextExtractor,
  TextExtractionInput,
  TextExtractionResult,
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
export declare class URLExtractor implements ITextExtractor {
  private readonly logger;
  getName(): string;
  supports(input: TextExtractionInput): boolean;
  extractText(input: TextExtractionInput): Promise<TextExtractionResult>;
}
//# sourceMappingURL=url.extractor.d.ts.map
