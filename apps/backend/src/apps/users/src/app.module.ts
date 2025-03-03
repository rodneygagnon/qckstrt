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

import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/user/users.module';

import configuration from 'src/config';

import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { DbModule } from 'src/db/db.module';
import { UserEntity } from 'src/db/entities/user.entity';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLExceptionFilter } from 'src/common/exceptions/graphql-exception.filter';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CaslModule } from 'src/permissions/casl.module';
import { PoliciesGuard } from 'src/common/guards/policies.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DbModule.forRoot({ entities: [UserEntity] }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { path: 'schema.gql', federation: 2 },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    CaslModule.forRoot(),
    UsersModule,
    AuthModule,
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
