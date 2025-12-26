import { registerAs } from '@nestjs/config';

/**
 * File Storage Configuration
 *
 * Maps FILE_* environment variables to nested config.
 * Used by documents service for file storage operations.
 */
export default registerAs('file', () => ({
  bucket: process.env.FILE_BUCKET || 'documents',
  sqsUrl: process.env.FILE_SQS_URL || '',
  snsTopicArn: process.env.FILE_SNS_TOPIC_ARN || '',
  snsRoleArn: process.env.FILE_SNS_ROLE_ARN || '',
}));
