/**
 * Text Extraction Types and Interfaces
 *
 * This module defines the Strategy Pattern for text extraction.
 * Different extractors can be swapped based on input type.
 */
/**
 * Input types for text extraction
 */
export type TextExtractionInput =
  | {
      type: "url";
      url: string;
      userId: string;
    }
  | {
      type: "s3";
      bucket: string;
      key: string;
      userId: string;
    }
  | {
      type: "file";
      buffer: Buffer;
      mimeType: string;
      userId: string;
    };
/**
 * Result of text extraction
 */
export interface TextExtractionResult {
  text: string;
  metadata: {
    source: string;
    extractedAt: Date;
    extractor: string;
    [key: string]: any;
  };
}
/**
 * Strategy interface for text extractors
 *
 * Implementations should handle specific input types
 * (e.g., URLs, S3 files, uploaded files)
 */
export interface ITextExtractor {
  /**
   * Extract text from the given input
   */
  extractText(input: TextExtractionInput): Promise<TextExtractionResult>;
  /**
   * Check if this extractor supports the given input
   */
  supports(input: TextExtractionInput): boolean;
  /**
   * Extractor name for logging/metadata
   */
  getName(): string;
}
/**
 * Exception thrown when no extractor supports the input
 */
export declare class NoExtractorFoundError extends Error {
  constructor(inputType: string);
}
/**
 * Exception thrown when extraction fails
 */
export declare class ExtractionError extends Error {
  extractor: string;
  originalError: Error;
  constructor(extractor: string, originalError: Error);
}
//# sourceMappingURL=types.d.ts.map
