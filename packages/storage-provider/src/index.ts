/**
 * @qckstrt/storage-provider
 *
 * Storage provider implementations for the QCKSTRT platform.
 * Provides pluggable file storage with AWS S3 support.
 */

// Re-export types from common
export {
  IStorageProvider,
  IStorageConfig,
  IStorageFile,
  IListFilesResult,
  ISignedUrlOptions,
  StorageError,
} from "@qckstrt/common";

// Providers
export { S3StorageProvider } from "./providers/s3.provider.js";

// Module
export { StorageModule } from "./storage.module.js";
