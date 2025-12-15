/**
 * @qckstrt/storage-provider
 *
 * Storage provider implementations for the QCKSTRT platform.
 * Provides pluggable file storage with Supabase Storage.
 */
export {
  IStorageProvider,
  IStorageConfig,
  IStorageFile,
  IListFilesResult,
  ISignedUrlOptions,
  StorageError,
} from "@qckstrt/common";
export { SupabaseStorageProvider } from "./providers/supabase.provider.js";
export { StorageModule } from "./storage.module.js";
//# sourceMappingURL=index.d.ts.map
