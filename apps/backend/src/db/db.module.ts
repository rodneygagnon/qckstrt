import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';

// import { ConfigDBData } from '../config/config.interface';
// import { Logger } from '../logger/logger';
// import { LoggerModule } from '../logger/logger.module';

import { DataSourceOptions } from 'typeorm';

interface DbConfig {
  entities: DataSourceOptions['entities'];
}

import configuration from 'src/config';

import { DbConfigError } from './db.errors';
import { IDBConfig } from 'src/config';

@Module({})
export class DbModule {
  private static getConnectionOptions(
    configService: ConfigService,
    dbconfig: DbConfig,
  ): TypeOrmModuleOptions {
    const dbConfig: IDBConfig | undefined = configService.get<IDBConfig>('db');

    if (!dbConfig) {
      throw new DbConfigError('Database config is missing');
    }

    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      // url: dbdata.url,
      keepConnectionAlive: true,
      ssl:
        /* (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test')
        ? { rejectUnauthorized: false } : */
        false,
      entities: dbconfig.entities,
      synchronize: true,
      logging: false,
    };
  }

  public static forRoot(dbconfig: DbConfig): DynamicModule {
    return {
      module: DbModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
          ],
          useFactory: (configService: ConfigService) =>
            DbModule.getConnectionOptions(configService, dbconfig),
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
