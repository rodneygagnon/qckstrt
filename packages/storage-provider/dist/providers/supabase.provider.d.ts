import { ConfigService } from "@nestjs/config";
import {
  IStorageProvider,
  IListFilesResult,
  IStorageFile,
  ISignedUrlOptions,
} from "@qckstrt/common";
/**
 * Supabase Storage Provider
 *
 * Implements file storage operations using Supabase Storage.
 * Provides an OSS alternative to AWS S3.
 */
export declare class SupabaseStorageProvider implements IStorageProvider {
  private configService;
  private readonly logger;
  private readonly supabase;
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
//# sourceMappingURL=supabase.provider.d.ts.map
