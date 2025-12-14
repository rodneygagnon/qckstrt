"use strict";
/**
 * Text Extraction Provider Package
 *
 * Strategy Pattern + Dependency Injection for text extraction.
 * Supports multiple sources: URLs, local files, S3, etc.
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionError = exports.NoExtractorFoundError = void 0;
// Re-export types from common
var common_1 = require("@qckstrt/common");
Object.defineProperty(exports, "NoExtractorFoundError", {
  enumerable: true,
  get: function () {
    return common_1.NoExtractorFoundError;
  },
});
Object.defineProperty(exports, "ExtractionError", {
  enumerable: true,
  get: function () {
    return common_1.ExtractionError;
  },
});
// Extractor implementations
__exportStar(require("./extractors/url.extractor.js"), exports);
// Service
__exportStar(require("./extraction.service.js"), exports);
// NestJS Module
__exportStar(require("./extraction.module.js"), exports);
//# sourceMappingURL=index.js.map
