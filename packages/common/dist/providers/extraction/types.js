"use strict";
/**
 * Text Extraction Types and Interfaces
 *
 * This module defines the Strategy Pattern for text extraction.
 * Different extractors can be swapped based on input type.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionError = exports.NoExtractorFoundError = void 0;
/**
 * Exception thrown when no extractor supports the input
 */
class NoExtractorFoundError extends Error {
  constructor(inputType) {
    super(`No extractor found that supports input type: ${inputType}`);
    this.name = "NoExtractorFoundError";
  }
}
exports.NoExtractorFoundError = NoExtractorFoundError;
/**
 * Exception thrown when extraction fails
 */
class ExtractionError extends Error {
  extractor;
  originalError;
  constructor(extractor, originalError) {
    super(`Extraction failed in ${extractor}: ${originalError.message}`);
    this.extractor = extractor;
    this.originalError = originalError;
    this.name = "ExtractionError";
  }
}
exports.ExtractionError = ExtractionError;
//# sourceMappingURL=types.js.map
