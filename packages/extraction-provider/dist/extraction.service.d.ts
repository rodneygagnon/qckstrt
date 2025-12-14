import {
  ITextExtractor,
  TextExtractionInput,
  TextExtractionResult,
} from "@qckstrt/common";
/**
 * Text Extraction Service
 *
 * Uses Strategy Pattern + Dependency Injection to select the appropriate
 * extractor based on input type.
 *
 * Extractors are injected via constructor, making it easy to:
 * - Add new extractors
 * - Swap implementations
 * - Test with mocks
 */
export declare class TextExtractionService {
  private readonly extractors;
  private readonly logger;
  constructor(extractors: ITextExtractor[]);
  /**
   * Extract text from any supported input
   *
   * Strategy Pattern: Dynamically selects the right extractor based on input type
   */
  extractText(input: TextExtractionInput): Promise<TextExtractionResult>;
  /**
   * Get list of supported input types
   */
  getSupportedTypes(): string[];
}
//# sourceMappingURL=extraction.service.d.ts.map
