import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { AuditLogService } from '../services/audit-log.service';
import { GraphQLAuditInterceptor } from '../interceptors/graphql-audit.interceptor';

export interface AuditModuleOptions {
  /**
   * Whether to enable the GraphQL audit interceptor globally
   * Default: true
   */
  enableInterceptor?: boolean;
}

@Global()
@Module({})
export class AuditModule {
  static forRoot(options: AuditModuleOptions = {}): DynamicModule {
    const { enableInterceptor = true } = options;

    const providers: Provider[] = [AuditLogService];

    if (enableInterceptor) {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: GraphQLAuditInterceptor,
      });
    }

    return {
      module: AuditModule,
      imports: [ConfigModule, TypeOrmModule.forFeature([AuditLogEntity])],
      providers,
      exports: [AuditLogService],
    };
  }
}
