/**
 * Storage Provider Types
 *
 * Interfaces for file storage operations (S3, local filesystem, etc.)
 */
/**
 * File listing result
 */
export interface IStorageFile {
  key: string;
  size?: number;
  lastModified?: Date;
  etag?: string;
}
/**
 * List files result
 */
export interface IListFilesResult {
  files: IStorageFile[];
  continuationToken?: string;
  isTruncated?: boolean;
}
/**
 * Signed URL options
 */
export interface ISignedUrlOptions {
  expiresIn?: number;
  contentType?: string;
}
/**
 * Storage provider interface
 */
export interface IStorageProvider {
  /**
   * Get provider name
   */
  getName(): string;
  /**
   * List files in a directory/prefix
   */
  listFiles(bucket: string, prefix: string): Promise<IListFilesResult>;
  /**
   * Get a signed URL for upload or download
   */
  getSignedUrl(
    bucket: string,
    key: string,
    upload: boolean,
    options?: ISignedUrlOptions,
  ): Promise<string>;
  /**
   * Delete a file
   */
  deleteFile(bucket: string, key: string): Promise<boolean>;
  /**
   * Check if a file exists
   */
  exists?(bucket: string, key: string): Promise<boolean>;
  /**
   * Get file metadata
   */
  getMetadata?(bucket: string, key: string): Promise<IStorageFile | null>;
}
/**
 * Storage provider configuration
 */
export interface IStorageConfig {
  region: string;
  bucket?: string;
  endpoint?: string;
}
/**
 * Storage error class
 */
export declare class StorageError extends Error {
  readonly code: string;
  readonly cause?: Error | undefined;
  constructor(message: string, code: string, cause?: Error | undefined);
}
//# sourceMappingURL=types.d.ts.map
