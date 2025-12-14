import { ConfigService } from "@nestjs/config";
import {
  IStorageProvider,
  IListFilesResult,
  IStorageFile,
  ISignedUrlOptions,
} from "@qckstrt/common";
/**
 * AWS S3 Storage Provider
 *
 * Implements file storage operations using AWS S3.
 */
export declare class S3StorageProvider implements IStorageProvider {
  private configService;
  private readonly logger;
  private readonly s3Client;
  private readonly config;
  constructor(configService: ConfigService);
  getName(): string;
  listFiles(bucket: string, prefix: string): Promise<IListFilesResult>;
  getSignedUrl(
    bucket: string,
    key: string,
    upload: boolean,
    options?: ISignedUrlOptions,
  ): Promise<string>;
  deleteFile(bucket: string, key: string): Promise<boolean>;
  exists(bucket: string, key: string): Promise<boolean>;
  getMetadata(bucket: string, key: string): Promise<IStorageFile | null>;
}
//# sourceMappingURL=s3.provider.d.ts.map
