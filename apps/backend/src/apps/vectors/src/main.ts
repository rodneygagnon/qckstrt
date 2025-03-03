import dotenv from 'dotenv';
dotenv.config();

import getConfig from 'src/config';

import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';

import eventHandler from './eventHandler';

export default async function bootstrap() {
  console.time('#perf bootup time');

  const config = await getConfig();

  const app = Consumer.create({
    queueUrl: config.file.sqsUrl || '',
    sqs: new SQSClient({ region: process.env.AWS_REGION }),
    handleMessage: async (message) => {
      console.log(message);

      if (message.Body) {
        await eventHandler(config, JSON.parse(message.Body));
      } else {
        console.log('No message body found');
      }
    },
  });

  app.on('error', (err) => {
    console.error(err.message);
  });

  app.on('processing_error', (err) => {
    console.error(err.message);
  });

  app.start();
  console.timeEnd('#perf bootup time');
}

bootstrap();
