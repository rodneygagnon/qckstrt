import { Module } from "@nestjs/common";
import { TextExtractionService } from "./extraction.service.js";
import { ITextExtractor } from "@qckstrt/common";
import { URLExtractor } from "./extractors/url.extractor.js";

/**
 * Extraction Module
 *
 * Configures Dependency Injection for text extraction strategies.
 *
 * To add a new extractor:
 * 1. Implement ITextExtractor interface
 * 2. Add to providers array
 * 3. Add to TEXT_EXTRACTORS factory
 */
@Module({
  providers: [
    // Individual extractor implementations
    URLExtractor,

    // Array of all extractors (injected into TextExtractionService)
    {
      provide: "TEXT_EXTRACTORS",
      useFactory: (urlExtractor: URLExtractor): ITextExtractor[] => {
        // Order matters: first matching extractor wins
        return [
          urlExtractor, // OSS for URLs
          // Add more extractors here:
          // firecrawlExtractor,
          // tesseractExtractor,
        ];
      },
      inject: [URLExtractor],
    },

    // Main service that uses the extractors
    {
      provide: TextExtractionService,
      useFactory: (extractors: ITextExtractor[]) => {
        return new TextExtractionService(extractors);
      },
      inject: ["TEXT_EXTRACTORS"],
    },
  ],
  exports: [TextExtractionService],
})
export class ExtractionModule {}
