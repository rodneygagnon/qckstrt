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
var SupabaseStorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const common_2 = require("@qckstrt/common");
/**
 * Supabase Storage Provider
 *
 * Implements file storage operations using Supabase Storage.
 * Provides an OSS alternative to AWS S3.
 */
let SupabaseStorageProvider =
  (SupabaseStorageProvider_1 = class SupabaseStorageProvider {
    configService;
    logger = new common_1.Logger(SupabaseStorageProvider_1.name, {
      timestamp: true,
    });
    supabase;
    constructor(configService) {
      this.configService = configService;
      const supabaseUrl = configService.get("supabase.url");
      const supabaseServiceKey = configService.get("supabase.serviceRoleKey");
      const supabaseAnonKey = configService.get("supabase.anonKey");
      if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
        throw new common_2.StorageError(
          "Supabase URL and key are required",
          "CONFIG_ERROR",
        );
      }
      // Use service role key for admin operations, fall back to anon key
      const key = supabaseServiceKey || supabaseAnonKey;
      this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.logger.log(
        `SupabaseStorageProvider initialized for: ${supabaseUrl}`,
      );
    }
    getName() {
      return "SupabaseStorageProvider";
    }
    async listFiles(bucket, prefix) {
      try {
        // Normalize prefix - remove leading/trailing slashes for Supabase
        const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "");
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .list(normalizedPrefix, {
            limit: 1000,
            offset: 0,
          });
        if (error) {
          throw error;
        }
        const files = (data || []).map((item) => ({
          key: normalizedPrefix
            ? `${normalizedPrefix}/${item.name}`
            : item.name,
          size: item.metadata?.size,
          lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
          etag: item.metadata?.eTag,
        }));
        return {
          files,
          isTruncated: data ? data.length >= 1000 : false,
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
        if (upload) {
          const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUploadUrl(key);
          if (error) {
            throw error;
          }
          return data.signedUrl;
        } else {
          const { data, error } = await this.supabase.storage
            .from(bucket)
            .createSignedUrl(key, expiresIn);
          if (error) {
            throw error;
          }
          return data.signedUrl;
        }
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
        const { error } = await this.supabase.storage
          .from(bucket)
          .remove([key]);
        if (error) {
          throw error;
        }
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
        // Parse the key to get folder and file name
        const lastSlash = key.lastIndexOf("/");
        const folder = lastSlash > 0 ? key.substring(0, lastSlash) : "";
        const fileName = lastSlash > 0 ? key.substring(lastSlash + 1) : key;
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .list(folder, {
            limit: 1,
            search: fileName,
          });
        if (error) {
          throw error;
        }
        return data?.some((file) => file.name === fileName) || false;
      } catch (error) {
        this.logger.error(`Error checking file existence: ${error.message}`);
        throw new common_2.StorageError(
          `Failed to check existence of ${bucket}/${key}`,
          "EXISTS_ERROR",
          error,
        );
      }
    }
    async getMetadata(bucket, key) {
      try {
        // Parse the key to get folder and file name
        const lastSlash = key.lastIndexOf("/");
        const folder = lastSlash > 0 ? key.substring(0, lastSlash) : "";
        const fileName = lastSlash > 0 ? key.substring(lastSlash + 1) : key;
        const { data, error } = await this.supabase.storage
          .from(bucket)
          .list(folder, {
            limit: 1,
            search: fileName,
          });
        if (error) {
          throw error;
        }
        const file = data?.find((f) => f.name === fileName);
        if (!file) {
          return null;
        }
        return {
          key,
          size: file.metadata?.size,
          lastModified: file.updated_at ? new Date(file.updated_at) : undefined,
          etag: file.metadata?.eTag,
        };
      } catch (error) {
        this.logger.error(`Error getting file metadata: ${error.message}`);
        throw new common_2.StorageError(
          `Failed to get metadata for ${bucket}/${key}`,
          "METADATA_ERROR",
          error,
        );
      }
    }
  });
exports.SupabaseStorageProvider = SupabaseStorageProvider;
exports.SupabaseStorageProvider =
  SupabaseStorageProvider =
  SupabaseStorageProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      SupabaseStorageProvider,
    );
//# sourceMappingURL=supabase.provider.js.map
