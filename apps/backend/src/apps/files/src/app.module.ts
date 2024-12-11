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
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';

import { FilesModule } from './domains/files/files.module';

import configuration from 'src/config';

import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { DbModule } from 'src/db/db.module';

import { File } from 'src/apps/files/src/domains/files/models/file.model';
import { User } from 'src/apps/files/src/domains/files/models/user.model';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLExceptionFilter } from 'src/common/exceptions/graphql-exception.filter';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CaslModule } from 'src/permissions/casl.module';
import { PoliciesGuard } from 'src/common/guards/policies.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DbModule.forRoot({ entities: [File] }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { path: 'files-schema.gql', federation: 2 },
      plugins: [ApolloServerPluginInlineTrace()],
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
    CaslModule.forRoot(),
    FilesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GraphQLExceptionFilter },
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
