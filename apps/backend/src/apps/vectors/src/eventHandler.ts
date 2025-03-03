/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventSource } from 'src/common/enums/event.enums';
import {
  ITextExtraction,
  startTextExtraction,
  getTextExtraction,
} from './domains/ocr/ocr';
import { createEmbeddingsForDocument } from './domains/ai/ai';

import { IAppConfig } from 'src/config';

export default async (config: IAppConfig, event: any) => {
  if (!event) {
    return;
  }

  // If Type exists, process SNS Notification
  if (event.Type) {
    switch (event.Type) {
      case EventSource.SNS: {
        console.log('SNS event');
        const textExtraction: ITextExtraction | undefined =
          await getTextExtraction(config, JSON.parse(event.Message));

        if (textExtraction) {
          console.log('textExtraction: ', textExtraction);
          createEmbeddingsForDocument(config, textExtraction);
        }

        break;
      }
      default:
        console.log('Unknown SNS Type: ', event.Type);
        break;
    }
    return;
  }

  if (event.Records && event.Records.length > 0) {
    event.Records.forEach((record: any) => {
      console.log(record);

      switch (record.eventSource) {
        case EventSource.S3:
          console.log('S3 event');
          startTextExtraction(config, record.eventName, record.s3);
          break;
        default:
          console.log('Unknown S3 Event: ', record.eventSource);
          break;
      }
    });
    return;
  }
};
