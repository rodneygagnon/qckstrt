/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import configuration from 'src/config';

import { HMACMiddleware } from 'src/common/middleware/hmac.middleware';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/providers/auth/jwt.strategy';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';

const handleAuth = ({ req }: any) => {
  if (req.headers.authorization) {
    return {
      user: req.headers.user,
    };
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
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
          buildService: ({ name, url }) => {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }: any) {
                request.http.headers.set('user', context.user);
              },
            });
          },
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: JSON.parse(
              configService.get('MICROSERVICES') as string | '',
            ),
            // [
            //   { name: 'users', url: 'http://users:3002/graphql' },
            //   { name: 'posts', url: 'http://posts:3003/graphql' },
            // ],
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
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
