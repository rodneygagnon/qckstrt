/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { File } from './models/file.model';
import { AWSS3 } from 'src/providers/files/aws.s3';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name, { timestamp: true });

  constructor(
    @Inject() private awsS3: AWSS3,
    private configService: ConfigService,
  ) {}

  async listFiles(userId: string): Promise<File[]> {
    const results = await this.awsS3.listFiles(userId);
    const awsFiles = results.Contents;

    const files: File[] = awsFiles
      ? awsFiles.map((file: any) => {
          return {
            userId,
            filename: file.Key?.split('/')[1],
            size: file.Size,
            lastModified: file.LastModified,
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
    return this.awsS3.getSignedUrl(userId, filename, upload);
  }

  deleteFile(userId: string, filename: string): Promise<boolean> {
    return this.awsS3.deleteFile(userId, filename);
  }
}
