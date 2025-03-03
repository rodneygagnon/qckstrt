/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Handler } from 'aws-lambda';

import getConfig from 'src/config';

import eventHandler from './eventHandler';

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

process.on('uncaughtException', (reason) => {
  console.error(reason);
});

export const handler: Handler = async (event: any, context: Context) => {
  const config = await getConfig();

  await eventHandler(config, event);

  return context.logStreamName;
};
