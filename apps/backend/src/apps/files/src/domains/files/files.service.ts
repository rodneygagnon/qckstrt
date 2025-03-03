/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { File } from './models/file.model';

import { Storage } from 'src/providers/files';
import { AI } from 'src/providers/ai';

import { IFileConfig } from 'src/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from 'src/db/entities/document.entity';
import { EmbeddingEntity } from 'src/db/entities/embedding.entity';
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name, { timestamp: true });
  private fileConfig: IFileConfig;

  constructor(
    @InjectRepository(DocumentEntity)
    private documentRepo: Repository<DocumentEntity>,
    @InjectRepository(EmbeddingEntity)
    private embeddingRepo: Repository<EmbeddingEntity>,
    @Inject() private storage: Storage,
    @Inject() private ai: AI,
    private configService: ConfigService,
  ) {
    const fileConfig: IFileConfig | undefined =
      configService.get<IFileConfig>('file');

    if (!fileConfig) {
      throw new Error('File storage config is missing');
    }

    this.fileConfig = fileConfig;
  }

  async listFiles(userId: string): Promise<File[]> {
    const documents = await this.documentRepo.find({ where: { userId } });

    const files: File[] = documents
      ? documents.map((document: any) => {
          return {
            userId,
            filename: document.key,
            size: document.size,
            status: document.status,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          } as File;
        })
      : [];

    return files;
  }

  getUploadUrl(userId: string, filename: string): Promise<string> {
    return this.getSignedUrl(userId, filename, true);
  }

  getDownloadUrl(userId: string, filename: string): Promise<string> {
    return this.getSignedUrl(userId, filename, false);
  }

  private getSignedUrl(
    userId: string,
    filename: string,
    upload: boolean,
  ): Promise<string> {
    return this.storage.getSignedUrl(
      this.fileConfig.bucket,
      userId,
      filename,
      upload,
    );
  }

  async answerQuery(userId: string, query: string): Promise<string> {
    const texts = await this.semanticSearch(userId, query);

    console.log('answerQuery(texts): ', texts);

    return Promise.resolve(`answerQuery: ${userId}/${query}`);
  }

  async searchText(
    userId: string,
    query: string,
    count: number,
  ): Promise<string[]> {
    const texts = await this.semanticSearch(userId, query, count);

    console.log('searchText(texts): ', texts);

    return Promise.resolve([`searchText: ${userId}/${query}/${count}`]);
  }

  private async semanticSearch(
    userId: string,
    query: string,
    count: number = 3,
  ): Promise<string[]> {
    const queryEmbeddingString: string = `[${(await this.ai.getEmbeddingsForQuery(query)).join(',')}]`;

    const texts = await this.embeddingRepo.query(
      `SELECT *, embedding <-> $1 AS distance
       FROM embeddings
       WHERE userId = $2
       ORDER BY distance
       LIMIT $3;`,
      [queryEmbeddingString, userId, count],
    );

    console.log('semanticSearch(texts): ', texts);

    return Promise.resolve(texts.map((text: any) => text.content));
  }

  deleteFile(userId: string, filename: string): Promise<boolean> {
    return this.storage.deleteFile(this.fileConfig.bucket, userId, filename);
  }
}
