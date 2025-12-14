/**
 * Text Extraction Provider Package
 *
 * Strategy Pattern + Dependency Injection for text extraction.
 * Supports multiple sources: URLs, local files, S3, etc.
 */
export {
  ITextExtractor,
  TextExtractionInput,
  TextExtractionResult,
  NoExtractorFoundError,
  ExtractionError,
} from "@qckstrt/common";
export * from "./extractors/url.extractor.js";
export * from "./extraction.service.js";
export * from "./extraction.module.js";
//# sourceMappingURL=index.d.ts.map
