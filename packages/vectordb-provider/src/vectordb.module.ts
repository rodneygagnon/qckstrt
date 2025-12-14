import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IVectorDBProvider } from "@qckstrt/common";
import { ChromaDBProvider } from "./providers/chroma.provider.js";

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
@Module({
  providers: [
    // Vector DB provider selection
    {
      provide: "VECTOR_DB_PROVIDER",
      useFactory: async (
        configService: ConfigService,
      ): Promise<IVectorDBProvider> => {
        const provider =
          configService.get<string>("vectordb.provider") || "chromadb";
        const dimensions =
          configService.get<number>("vectordb.dimensions") || 384;

        let vectorDBProvider: IVectorDBProvider;

        switch (provider.toLowerCase()) {
          case "chromadb":
          default:
            // OSS: Use ChromaDB (dedicated vector database)
            const chromaUrl =
              configService.get<string>("vectordb.chromadb.url") ||
              "http://localhost:8000";
            const project = configService.get<string>("project") || "default";
            const collectionName = `${project}_embeddings`;

            vectorDBProvider = new ChromaDBProvider(
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
      inject: [ConfigService],
    },
  ],
  exports: ["VECTOR_DB_PROVIDER"],
})
export class VectorDBModule {}
