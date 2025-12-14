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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var S3StorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const common_2 = require("@qckstrt/common");
/**
 * AWS S3 Storage Provider
 *
 * Implements file storage operations using AWS S3.
 */
let S3StorageProvider = (S3StorageProvider_1 = class S3StorageProvider {
  configService;
  logger = new common_1.Logger(S3StorageProvider_1.name, {
    timestamp: true,
  });
  s3Client;
  config;
  constructor(configService) {
    this.configService = configService;
    const region = configService.get("region") || "us-east-1";
    const endpoint = configService.get("s3.endpoint");
    this.config = {
      region,
      endpoint,
      bucket: configService.get("s3.bucket"),
    };
    this.s3Client = new client_s3_1.S3Client({
      region,
      ...(endpoint && { endpoint }),
    });
    this.logger.log(`S3StorageProvider initialized for region: ${region}`);
  }
  getName() {
    return "S3StorageProvider";
  }
  async listFiles(bucket, prefix) {
    try {
      const command = new client_s3_1.ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
      });
      const response = await this.s3Client.send(command);
      const files = (response.Contents || []).map((item) => ({
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
      this.logger.error(`Error listing files: ${error.message}`);
      throw new common_2.StorageError(
        `Failed to list files in ${bucket}/${prefix}`,
        "LIST_ERROR",
        error,
      );
    }
  }
  async getSignedUrl(bucket, key, upload, options = {}) {
    try {
      const expiresIn = options.expiresIn || 3600;
      const command = upload
        ? new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ...(options.contentType && { ContentType: options.contentType }),
          })
        : new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
      return await (0, s3_request_presigner_1.getSignedUrl)(
        this.s3Client,
        command,
        { expiresIn },
      );
    } catch (error) {
      this.logger.error(`Error getting signed URL: ${error.message}`);
      throw new common_2.StorageError(
        `Failed to get signed URL for ${bucket}/${key}`,
        "SIGNED_URL_ERROR",
        error,
      );
    }
  }
  async deleteFile(bucket, key) {
    try {
      const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      this.logger.log(`Deleted file: ${bucket}/${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new common_2.StorageError(
        `Failed to delete ${bucket}/${key}`,
        "DELETE_ERROR",
        error,
      );
    }
  }
  async exists(bucket, key) {
    try {
      const command = new client_s3_1.HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === "NotFound") {
        return false;
      }
      throw new common_2.StorageError(
        `Failed to check existence of ${bucket}/${key}`,
        "EXISTS_ERROR",
        error,
      );
    }
  }
  async getMetadata(bucket, key) {
    try {
      const command = new client_s3_1.HeadObjectCommand({
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
      if (error.name === "NotFound") {
        return null;
      }
      throw new common_2.StorageError(
        `Failed to get metadata for ${bucket}/${key}`,
        "METADATA_ERROR",
        error,
      );
    }
  }
});
exports.S3StorageProvider = S3StorageProvider;
exports.S3StorageProvider =
  S3StorageProvider =
  S3StorageProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      S3StorageProvider,
    );
//# sourceMappingURL=s3.provider.js.map
