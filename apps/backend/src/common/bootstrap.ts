import serverlessExpress from '@codegenie/serverless-express';
import { INestApplication, Logger, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Handler } from 'aws-lambda';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import helmet from 'helmet';

import { env } from 'process';

import { ConfigService } from '@nestjs/config';

/**
 * Get CORS configuration based on environment
 * In production, restricts origins to ALLOWED_ORIGINS env var
 * In development, allows all origins for easier testing
 */
function getCorsConfig(configService: ConfigService): CorsOptions {
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  const isProd = env.ENV === 'prod';

  if (isProd && allowedOrigins) {
    const origins = allowedOrigins.split(',').map((o) => o.trim());
    return {
      origin: origins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400, // 24 hours
    };
  }

  // Development: allow all origins
  return {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  };
}

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
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');
  const appName = configService.get('application');
  const appDescription = configService.get('description');
  const appVersion = configService.get('version');

  app.use(helmet());
  app.enableCors(getCorsConfig(configService));

  if (env.ENV !== 'prod') {
    setupSwagger(app, appName, appDescription, appVersion);
  }

  await app.listen(port);
  const bootupTime = Date.now() - startTime;
  logger.log(`Now listening on port ${port} (bootup time: ${bootupTime}ms)`);

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
