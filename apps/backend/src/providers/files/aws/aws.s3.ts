/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export class AWSS3 {
  private s3Client: S3Client;

  constructor(region: string) {
    this.s3Client = new S3Client({ region });
  }

  async listFiles(bucket: string, userId: string): Promise<any> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${userId}/`,
      });
      return this.s3Client.send(command);
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(
    bucket: string,
    userId: string,
    filename: string,
    upload: boolean,
  ): Promise<string> {
    try {
      const Key = `${userId}/${filename}`;

      const command: GetObjectCommand | PutObjectCommand = upload
        ? new PutObjectCommand({ Bucket: bucket, Key })
        : new GetObjectCommand({ Bucket: bucket, Key });

      return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(
    bucket: string,
    userId: string,
    filename: string,
  ): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: `${userId}/${filename}`,
      });

      await this.s3Client.send(command);

      return Promise.resolve(true);
    } catch (error) {
      console.log(`Error getting signed url: ${error.message}`);
      throw error;
    }
  }
}
