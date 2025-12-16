import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import configuration from 'src/config';
import { DbConfigError } from './db.errors';
import {
  RelationalDBModule,
  IRelationalDBProvider,
} from '@qckstrt/relationaldb-provider';

interface DbEntityConfig {
  entities: DataSourceOptions['entities'];
}

/**
 * Database Module
 *
 * Provides TypeORM configuration using pluggable database providers.
 * Uses PostgreSQL via Supabase (includes pgvector for vectors).
 */
@Module({})
export class DbModule {
  public static forRoot(dbEntityConfig: DbEntityConfig): DynamicModule {
    return {
      module: DbModule,
      imports: [
        ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
        RelationalDBModule,
        TypeOrmModule.forRootAsync({
          imports: [RelationalDBModule],
          useFactory: (
            dbProvider: IRelationalDBProvider,
          ): TypeOrmModuleOptions => {
            if (!dbProvider) {
              throw new DbConfigError('Database provider not initialized');
            }

            // Get connection options from the injected provider
            const connectionOptions = dbProvider.getConnectionOptions(
              dbEntityConfig.entities,
            );

            return connectionOptions as TypeOrmModuleOptions;
          },
          inject: ['RELATIONAL_DB_PROVIDER'],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
