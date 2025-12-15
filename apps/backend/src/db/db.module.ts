import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
 * Supports PostgreSQL (default, via Supabase) and Aurora (AWS).
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
          useFactory: (dbProvider: IRelationalDBProvider) => {
            if (!dbProvider) {
              throw new DbConfigError('Database provider not initialized');
            }

            // Get connection options from the injected provider
            const connectionOptions = dbProvider.getConnectionOptions(
              dbEntityConfig.entities,
            );

            return connectionOptions;
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
