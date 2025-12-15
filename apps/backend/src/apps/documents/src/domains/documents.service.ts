import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStorageProvider } from '@qckstrt/storage-provider';
import { IFileConfig } from 'src/config';
import { DocumentEntity } from 'src/db/entities/document.entity';
import { File } from './models/file.model';

/**
 * Documents Service
 *
 * Handles document metadata management and file storage operations.
 * Manages DocumentEntity in PostgreSQL and file storage in S3.
 */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name, {
    timestamp: true,
  });
  private fileConfig: IFileConfig;

  constructor(
    @InjectRepository(DocumentEntity)
    private documentRepo: Repository<DocumentEntity>,
    @Inject('STORAGE_PROVIDER') private storage: IStorageProvider,
    private configService: ConfigService,
  ) {
    const fileConfig: IFileConfig | undefined =
      configService.get<IFileConfig>('file');

    if (!fileConfig) {
      throw new Error('File storage config is missing');
    }

    this.fileConfig = fileConfig;
  }

  /**
   * List all documents for a user
   */
  async listFiles(userId: string): Promise<File[]> {
    const documents = await this.documentRepo.find({ where: { userId } });

    const files: File[] = documents
      ? documents.map((document) => ({
          userId,
          filename: document.key,
          size: document.size,
          status: document.status,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        }))
      : [];

    return files;
  }

  /**
   * Get signed URL for uploading a file
   */
  getUploadUrl(userId: string, filename: string): Promise<string> {
    return this.getSignedUrl(userId, filename, true);
  }

  /**
   * Get signed URL for downloading a file
   */
  getDownloadUrl(userId: string, filename: string): Promise<string> {
    return this.getSignedUrl(userId, filename, false);
  }

  /**
   * Get S3 signed URL
   */
  private getSignedUrl(
    userId: string,
    filename: string,
    upload: boolean,
  ): Promise<string> {
    const key = `${userId}/${filename}`;
    return this.storage.getSignedUrl(this.fileConfig.bucket, key, upload);
  }

  /**
   * Delete a file and its metadata
   */
  async deleteFile(userId: string, filename: string): Promise<boolean> {
    this.logger.log(`Deleting file ${filename} for user ${userId}`);

    try {
      // Delete from S3
      const key = `${userId}/${filename}`;
      const deleted = await this.storage.deleteFile(
        this.fileConfig.bucket,
        key,
      );

      if (deleted) {
        // Delete metadata from database
        await this.documentRepo.delete({ userId, key: filename });
        this.logger.log(`Deleted file ${filename} successfully`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<DocumentEntity | null> {
    return this.documentRepo.findOne({ where: { id: documentId } });
  }

  /**
   * Create document metadata
   */
  async createDocument(
    location: string,
    userId: string,
    key: string,
    size: number,
    checksum: string,
  ): Promise<DocumentEntity> {
    return this.documentRepo.save({
      location,
      userId,
      key,
      size,
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    id: string,
    updates: Partial<DocumentEntity>,
  ): Promise<void> {
    await this.documentRepo.update(id, updates);
  }
}
