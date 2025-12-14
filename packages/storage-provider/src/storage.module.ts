import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3StorageProvider } from "./providers/s3.provider.js";

/**
 * Storage Module
 *
 * Provides file storage capabilities using pluggable providers.
 * Currently supports AWS S3.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    S3StorageProvider,
    {
      provide: "STORAGE_PROVIDER",
      useExisting: S3StorageProvider,
    },
  ],
  exports: [S3StorageProvider, "STORAGE_PROVIDER"],
})
export class StorageModule {}
