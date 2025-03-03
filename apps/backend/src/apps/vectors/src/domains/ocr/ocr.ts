/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppConfig } from 'src/config';
import { DocumentRepository } from './document.repository';
import { EventNamePrefix, EventStatus } from 'src/common/enums/event.enums';
import { AWSTextract } from 'src/providers/ocr/aws/aws.textract';
import { DocumentStatus } from 'src/common/enums/document.status.enum';

export interface ITextExtraction {
  userId: string;
  documentId: string;
  text: string;
}

export const startTextExtraction = async (
  config: IAppConfig,
  eventName: string,
  s3: any,
) => {
  if (eventName?.startsWith(EventNamePrefix.ObjectCreated)) {
    /**
     * Check whether we've already extracted and processed the text for this file
     * by searching for the file in the database by checksum (eTag)
     *
     * If so, return because there is nothing to do
     */
    try {
      const repository: DocumentRepository =
        await DocumentRepository.getInstance(config);

      let document = await repository.getDocumentByChecksum(s3.object.eTag);

      if (document === null) {
        const keys: string[] = s3.object.key.split('/');

        /** Create document record */
        document = await repository.createDocument(
          s3.bucket.name,
          keys[0],
          keys[1].replace(/\+/g, ' '),
          s3.object.size,
          s3.object.eTag,
        );
      } else if (document.status !== DocumentStatus.PROCESSINGNPENDING) {
        console.log('Document already exists and processed/ing: ', document);
        return;
      }

      const jobId = await new AWSTextract(
        config.region,
        config.file.snsTopicArn,
        config.file.snsRoleArn,
      ).detectText(s3.bucket.name, s3.object.key);
      console.log('AWSTextract(jobId): ', jobId);

      if (jobId !== null) {
        await repository.updateDocument(document.id, {
          status: DocumentStatus.TEXTEXTERACTIONSTARTED,
        });
      } else {
        await repository.updateDocument(document.id, {
          status: DocumentStatus.TEXTEXTERACTIONFAILED,
        });
      }
    } catch (error) {
      console.log('Error processing document: ', error);
    }
  } else {
    console.log('Unknown event: ', eventName);
  }
};

export const getTextExtraction = async (
  config: IAppConfig,
  message: any,
): Promise<ITextExtraction | undefined> => {
  console.log('message: ', message);

  if (EventStatus.SUCCEEDED === message.Status) {
    /**
     */
    const repository: DocumentRepository =
      await DocumentRepository.getInstance(config);

    const keys: string[] = message.DocumentLocation.S3ObjectName.split('/');

    const document = await repository.getDocumentByLocationUserKey(
      message.DocumentLocation.S3Bucket,
      keys[0],
      keys[1],
    );

    try {
      if (document === null) {
        console.log(
          `Document does not exist: ${message.DocumentLocation.S3Bucket}::${message.DocumentLocation.S3ObjectName}`,
        );
        return;
      }

      const text = await new AWSTextract(
        config.region,
        config.file.snsTopicArn,
        config.file.snsRoleArn,
      ).getText(message.JobId);

      await repository.updateDocument(document.id, {
        status: DocumentStatus.TEXTEXTERACTIONCOMPLETE,
      });

      return { userId: document.userId, documentId: document.id, text };
    } catch (error) {
      console.log('Error processing document: ', error);
      await repository.updateDocument(document!.id, {
        status: DocumentStatus.TEXTEXTERACTIONFAILED,
      });
    }
  } else {
    console.log('Unknown event status: ', message.Status);
  }
};
