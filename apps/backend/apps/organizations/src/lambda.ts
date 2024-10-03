import { Callback, Context, Handler } from 'aws-lambda';
import { env } from 'process';

import * as pkg from '../../../package.json';
import bootstrap from '../../common/bootstrap';
import { AppModule } from './app.module';

let server: Handler;

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

process.on('uncaughtException', (reason) => {
  console.error(reason);
});

export const handler: Handler = async (
  event: any, // TODO: properly define this, any on tutorial
  context: Context,
  callback: Callback,
) => {
  server = server ?? (
    await bootstrap(
      AppModule,
      env.ORGANIZATIONS_PORT || 3000,
      pkg.name,
      pkg.description,
      pkg.version,
    ));

  // console.log('handler event', event);
  // console.log('handler context', context);

  try {
    console.time('#perf handler time');
    return server(event, context, callback);
  } finally {
    console.timeEnd('#perf handler time');
  }
};
