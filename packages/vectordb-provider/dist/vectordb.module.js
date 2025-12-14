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
exports.VectorDBModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chroma_provider_js_1 = require("./providers/chroma.provider.js");
/**
 * Vector Database Module
 *
 * Configures Dependency Injection for vector database providers.
 *
 * To swap providers, change the VECTOR_DB_PROVIDER factory:
 * - chromadb (default, OSS, dedicated vector database)
 * - pgvector (OSS, consolidates with PostgreSQL - coming soon)
 * - Add your own implementation of IVectorDBProvider
 */
let VectorDBModule = class VectorDBModule {};
exports.VectorDBModule = VectorDBModule;
exports.VectorDBModule = VectorDBModule = __decorate(
  [
    (0, common_1.Module)({
      providers: [
        // Vector DB provider selection
        {
          provide: "VECTOR_DB_PROVIDER",
          useFactory: async (configService) => {
            const provider =
              configService.get("vectordb.provider") || "chromadb";
            const dimensions = configService.get("vectordb.dimensions") || 384;
            let vectorDBProvider;
            switch (provider.toLowerCase()) {
              case "chromadb":
              default:
                // OSS: Use ChromaDB (dedicated vector database)
                const chromaUrl =
                  configService.get("vectordb.chromadb.url") ||
                  "http://localhost:8000";
                const project = configService.get("project") || "default";
                const collectionName = `${project}_embeddings`;
                vectorDBProvider = new chroma_provider_js_1.ChromaDBProvider(
                  chromaUrl,
                  collectionName,
                  dimensions,
                );
                break;
              // TODO: Add pgvector provider
              // case 'pgvector':
              //   vectorDBProvider = new PgVectorProvider(...);
              //   break;
            }
            // Initialize the provider
            await vectorDBProvider.initialize();
            return vectorDBProvider;
          },
          inject: [config_1.ConfigService],
        },
      ],
      exports: ["VECTOR_DB_PROVIDER"],
    }),
  ],
  VectorDBModule,
);
//# sourceMappingURL=vectordb.module.js.map
