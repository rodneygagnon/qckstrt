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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const s3_provider_js_1 = require("./providers/s3.provider.js");
/**
 * Storage Module
 *
 * Provides file storage capabilities using pluggable providers.
 * Currently supports AWS S3.
 */
let StorageModule = class StorageModule {};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate(
  [
    (0, common_1.Global)(),
    (0, common_1.Module)({
      imports: [config_1.ConfigModule],
      providers: [
        s3_provider_js_1.S3StorageProvider,
        {
          provide: "STORAGE_PROVIDER",
          useExisting: s3_provider_js_1.S3StorageProvider,
        },
      ],
      exports: [s3_provider_js_1.S3StorageProvider, "STORAGE_PROVIDER"],
    }),
  ],
  StorageModule,
);
//# sourceMappingURL=storage.module.js.map
