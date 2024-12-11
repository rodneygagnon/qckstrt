/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { IFileConfig } from 'src/config';

@Injectable()
export class AWSS3 {
  private client: S3Client;
  private fileConfig: IFileConfig;

  constructor(private configService: ConfigService) {
    const fileConfig: IFileConfig | undefined =
      configService.get<IFileConfig>('file');

    if (!fileConfig) {
      throw new Error('File storage config is missing');
    }

    this.fileConfig = fileConfig;
    this.client = new S3Client({
      region: configService.get<string>('region'),
    });
  }

  async listFiles(userId: string): Promise<any> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.fileConfig.bucket,
        Prefix: `${userId}/`,
      });
      return this.client.send(command);
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(
    userId: string,
    filename: string,
    upload: boolean,
  ): Promise<string> {
    try {
      const Key = `${userId}/${filename}`;

      const command: GetObjectCommand | PutObjectCommand = upload
        ? new PutObjectCommand({ Bucket: this.fileConfig.bucket, Key })
        : new GetObjectCommand({ Bucket: this.fileConfig.bucket, Key });

      return getSignedUrl(this.client, command, { expiresIn: 3600 });
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(userId: string, filename: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.fileConfig.bucket,
        Key: `${userId}/${filename}`,
      });

      await this.client.send(command);

      return Promise.resolve(true);
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }
}
