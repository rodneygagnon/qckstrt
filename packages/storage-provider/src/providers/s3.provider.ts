import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  IStorageProvider,
  IStorageConfig,
  IListFilesResult,
  IStorageFile,
  ISignedUrlOptions,
  StorageError,
} from "@qckstrt/common";

/**
 * AWS S3 Storage Provider
 *
 * Implements file storage operations using AWS S3.
 */
@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name, {
    timestamp: true,
  });
  private readonly s3Client: S3Client;
  private readonly config: IStorageConfig;

  constructor(private configService: ConfigService) {
    const region = configService.get<string>("region") || "us-east-1";
    const endpoint = configService.get<string>("s3.endpoint");

    this.config = {
      region,
      endpoint,
      bucket: configService.get<string>("s3.bucket"),
    };

    this.s3Client = new S3Client({
      region,
      ...(endpoint && { endpoint }),
    });

    this.logger.log(`S3StorageProvider initialized for region: ${region}`);
  }

  getName(): string {
    return "S3StorageProvider";
  }

  async listFiles(bucket: string, prefix: string): Promise<IListFilesResult> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
      });

      const response = await this.s3Client.send(command);

      const files: IStorageFile[] = (response.Contents || []).map((item) => ({
        key: item.Key || "",
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
      }));

      return {
        files,
        continuationToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated,
      };
    } catch (error) {
      this.logger.error(`Error listing files: ${(error as Error).message}`);
      throw new StorageError(
        `Failed to list files in ${bucket}/${prefix}`,
        "LIST_ERROR",
        error as Error,
      );
    }
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    upload: boolean,
    options: ISignedUrlOptions = {},
  ): Promise<string> {
    try {
      const expiresIn = options.expiresIn || 3600;

      const command = upload
        ? new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ...(options.contentType && { ContentType: options.contentType }),
          })
        : new GetObjectCommand({ Bucket: bucket, Key: key });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(
        `Error getting signed URL: ${(error as Error).message}`,
      );
      throw new StorageError(
        `Failed to get signed URL for ${bucket}/${key}`,
        "SIGNED_URL_ERROR",
        error as Error,
      );
    }
  }

  async deleteFile(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`Deleted file: ${bucket}/${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file: ${(error as Error).message}`);
      throw new StorageError(
        `Failed to delete ${bucket}/${key}`,
        "DELETE_ERROR",
        error as Error,
      );
    }
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if ((error as { name?: string }).name === "NotFound") {
        return false;
      }
      throw new StorageError(
        `Failed to check existence of ${bucket}/${key}`,
        "EXISTS_ERROR",
        error as Error,
      );
    }
  }

  async getMetadata(bucket: string, key: string): Promise<IStorageFile | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        size: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error) {
      if ((error as { name?: string }).name === "NotFound") {
        return null;
      }
      throw new StorageError(
        `Failed to get metadata for ${bucket}/${key}`,
        "METADATA_ERROR",
        error as Error,
      );
    }
  }
}
