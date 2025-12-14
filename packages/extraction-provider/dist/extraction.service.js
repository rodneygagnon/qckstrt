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
var TextExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractionService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
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
let TextExtractionService =
  (TextExtractionService_1 = class TextExtractionService {
    extractors;
    logger = new common_1.Logger(TextExtractionService_1.name);
    constructor(
      // DI: All available extractors are injected
      extractors,
    ) {
      this.extractors = extractors;
      this.logger.log(
        `Initialized with ${extractors.length} extractors: ${extractors.map((e) => e.getName()).join(", ")}`,
      );
    }
    /**
     * Extract text from any supported input
     *
     * Strategy Pattern: Dynamically selects the right extractor based on input type
     */
    async extractText(input) {
      this.logger.log(`Extracting text from ${input.type} input`);
      // Find first extractor that supports this input
      const extractor = this.extractors.find((e) => e.supports(input));
      if (!extractor) {
        this.logger.error(`No extractor found for input type: ${input.type}`);
        throw new common_2.NoExtractorFoundError(input.type);
      }
      this.logger.log(`Using ${extractor.getName()} for extraction`);
      // Delegate to the selected extractor
      return extractor.extractText(input);
    }
    /**
     * Get list of supported input types
     */
    getSupportedTypes() {
      const types = new Set();
      // Test each extractor with dummy inputs
      const testInputs = [
        { type: "url", url: "", userId: "" },
        { type: "s3", bucket: "", key: "", userId: "" },
        { type: "file", buffer: Buffer.from(""), mimeType: "", userId: "" },
      ];
      testInputs.forEach((input) => {
        if (this.extractors.some((e) => e.supports(input))) {
          types.add(input.type);
        }
      });
      return Array.from(types);
    }
  });
exports.TextExtractionService = TextExtractionService;
exports.TextExtractionService =
  TextExtractionService =
  TextExtractionService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [Array])],
      TextExtractionService,
    );
//# sourceMappingURL=extraction.service.js.map
