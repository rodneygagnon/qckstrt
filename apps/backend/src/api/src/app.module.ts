import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from 'src/config';

import { HMACMiddleware } from 'src/common/middleware/hmac.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        server: {
          cors: true,
          path: 'api',
        },
        gateway: {
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HMACMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
