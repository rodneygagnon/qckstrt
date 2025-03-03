import {
  GetDocumentTextDetectionCommand,
  TextractClient,
  StartDocumentTextDetectionCommand,
} from '@aws-sdk/client-textract';

export class AWSTextract {
  private textractClient: TextractClient;

  constructor(
    private region: string,
    private snsTopicArn: string,
    private snsRoleArn: string,
  ) {
    console.log('SNS Topic ARN: ', snsTopicArn);
    console.log('SNS Role ARN: ', snsRoleArn);
    console.log('Region: ', region);

    this.textractClient = new TextractClient({ region });
  }

  async detectText(bucket: string, key: string): Promise<string | null> {
    console.log('Bucket: ', bucket);
    console.log('Key: ', key);
    try {
      const command = new StartDocumentTextDetectionCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: bucket,
            Name: key?.replace(/\+/g, ' '),
          },
        },
        NotificationChannel: {
          SNSTopicArn: this.snsTopicArn,
          RoleArn: this.snsRoleArn,
        },
      });

      const response = await this.textractClient.send(command);

      return Promise.resolve(response.JobId || '');
    } catch (error) {
      console.log('Error starting text extraction: ', error.message);
      return Promise.resolve(null);
    }
  }

  async getText(jobId: string): Promise<string> {
    try {
      const command = new GetDocumentTextDetectionCommand({
        JobId: jobId,
      });

      const response = await this.textractClient.send(command);

      return Promise.resolve(
        response.Blocks
          ? response.Blocks.reduce(
              (text, block) => text + ' ' + block.Text || '',
              '',
            )
          : '',
      );
    } catch (error) {
      console.log(`Error starting text extraction: ${error.message}`);
      throw error;
    }
  }
}
