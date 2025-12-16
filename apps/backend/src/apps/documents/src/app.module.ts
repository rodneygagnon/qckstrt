import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { LoggingModule, LogLevel } from '@qckstrt/logging-provider';
import depthLimit from 'graphql-depth-limit';

import { DocumentsModule } from './domains/documents.module';

import configuration from 'src/config';

import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { DbModule } from 'src/db/db.module';

import { User } from './domains/models/user.model';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLExceptionFilter } from 'src/common/exceptions/graphql-exception.filter';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GqlThrottlerGuard } from 'src/common/guards/throttler.guard';
import { CaslModule } from 'src/permissions/casl.module';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { DocumentEntity } from 'src/db/entities/document.entity';

/**
 * Documents App Module
 *
 * Handles document metadata and file storage operations.
 * Manages documents in PostgreSQL and files in S3.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggingModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        serviceName: 'documents-service',
        level:
          configService.get('NODE_ENV') === 'production'
            ? LogLevel.INFO
            : LogLevel.DEBUG,
        format:
          configService.get('NODE_ENV') === 'production' ? 'json' : 'pretty',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 50, // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DbModule.forRoot({ entities: [DocumentEntity] }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { path: 'documents-schema.gql', federation: 2 },
      plugins: [ApolloServerPluginInlineTrace()],
      validationRules: [depthLimit(10)],
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
    CaslModule.forRoot(),
    DocumentsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GraphQLExceptionFilter },
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
