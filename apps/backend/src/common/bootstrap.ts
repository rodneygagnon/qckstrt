import serverlessExpress from '@codegenie/serverless-express';
import { INestApplication, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Handler } from 'aws-lambda';

import helmet from 'helmet';

import { env } from 'process';

import { ConfigService } from '@nestjs/config';

function setupSwagger(
  app: INestApplication,
  appName: string = 'app',
  appDescription: string = 'API',
  appVersion: string = '1.0.0',
) {
  const options = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDescription)
    .setVersion(appVersion)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}

export default async function bootstrap(
  AppModule: Type<unknown>,
): Promise<Handler> {
  console.time('#perf bootup time');

  const app = await NestFactory.create(AppModule);
  const port = app.get<ConfigService>(ConfigService).get('port');
  const appName = app.get<ConfigService>(ConfigService).get('application');
  const appDescription = app
    .get<ConfigService>(ConfigService)
    .get('description');
  const appVersion = app.get<ConfigService>(ConfigService).get('version');

  app.use(helmet());

  if (env.ENV !== 'prod') {
    setupSwagger(app, appName, appDescription, appVersion);
  }

  await app.listen(port);
  console.log(`Now listening on port ${port}`);
  console.timeEnd('#perf bootup time');

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
