import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { DataSourceOptions } from 'typeorm';

interface DbEntityConfig {
  entities: DataSourceOptions['entities'];
}

import configuration from 'src/config';

import { DbConfigError } from './db.errors';
import { IDBConfig } from 'src/config';
import { getConnectionOptions } from 'src/providers/db';

@Module({})
export class DbModule {
  public static forRoot(dbEntityConfig: DbEntityConfig): DynamicModule {
    return {
      module: DbModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
          ],
          useFactory: (configService: ConfigService) => {
            const dbConfig: IDBConfig | undefined =
              configService.get<IDBConfig>('db');

            if (!dbConfig) {
              throw new DbConfigError('Database config is missing');
            }

            return getConnectionOptions(
              configService.get('region') || '',
              dbConfig,
              dbEntityConfig,
            );
          },
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
