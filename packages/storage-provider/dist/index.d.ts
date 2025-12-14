/**
 * @qckstrt/storage-provider
 *
 * Storage provider implementations for the QCKSTRT platform.
 * Provides pluggable file storage with AWS S3 support.
 */
export {
  IStorageProvider,
  IStorageConfig,
  IStorageFile,
  IListFilesResult,
  ISignedUrlOptions,
  StorageError,
} from "@qckstrt/common";
export { S3StorageProvider } from "./providers/s3.provider.js";
export { StorageModule } from "./storage.module.js";
//# sourceMappingURL=index.d.ts.map
