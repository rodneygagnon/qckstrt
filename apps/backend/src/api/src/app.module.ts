import {
  GraphQLDataSourceProcessOptions,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Request } from 'express';
import { LoggingModule, LogLevel } from '@qckstrt/logging-provider';

import configuration from 'src/config';

import { HMACMiddleware } from 'src/common/middleware/hmac.middleware';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/auth/jwt.strategy';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';

interface GatewayContext {
  user?: string;
}

const handleAuth = ({ req }: { req: Request }) => {
  if (req.headers.authorization) {
    return {
      user: req.headers.user as string | undefined,
    };
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    LoggingModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        serviceName: 'api-gateway',
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
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      useFactory: async (configService: ConfigService) => ({
        server: {
          cors: true,
          path: 'api',
          context: handleAuth,
        },
        gateway: {
          buildService: ({ url }) => {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({
                request,
                context,
              }: GraphQLDataSourceProcessOptions<GatewayContext>) {
                request.http?.headers.set('user', context?.user);
              },
            });
          },
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: JSON.parse(
              configService.get('MICROSERVICES') as string | '',
            ),
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    JwtStrategy,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HMACMiddleware, AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
