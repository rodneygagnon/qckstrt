import serverlessExpress from '@codegenie/serverless-express';
import { INestApplication, Logger, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Handler } from 'aws-lambda';

import helmet from 'helmet';

import { env } from 'process';

import { ConfigService } from '@nestjs/config';

const logger = new Logger('Bootstrap');

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
  const startTime = Date.now();

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
  const bootupTime = Date.now() - startTime;
  logger.log(`Now listening on port ${port} (bootup time: ${bootupTime}ms)`);

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
