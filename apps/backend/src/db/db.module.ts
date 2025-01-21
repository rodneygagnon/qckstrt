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

import configuration, { IDBLocalConfig, IDBRemoteConfig } from 'src/config';

import { DbConfigError } from './db.errors';
import { IDBConfig } from 'src/config';
import { DBConnection } from 'src/common/enums/db.enums';

@Module({})
export class DbModule {
  private static getConnectionOptions(
    configService: ConfigService,
    dbconfig: DbConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): TypeOrmModuleOptions | any {
    const dbConfig: IDBConfig | undefined = configService.get<IDBConfig>('db');

    if (!dbConfig) {
      throw new DbConfigError('Database config is missing');
    }

    if (dbConfig.connection === DBConnection.Remote) {
      const config = dbConfig.config as IDBRemoteConfig;

      return {
        type: config.type,
        database: config.database,
        secretArn: config.secretArn,
        resourceArn: config.resourceArn,
        region: configService.get('region'),
        serviceConfigOptions: {
          // additional options to pass to the aws-sdk RDS client
        },
        formatOptions: {
          // additional format options to pass to the Data API client
          enableUuidHack: true,
        },
        keepConnectionAlive: true,
        ssl:
          /* (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test')
            ? { rejectUnauthorized: false } : */
          false,
        entities: dbconfig.entities,
        synchronize: true,
        logging: false,
      };
    } else {
      const config = dbConfig.config as IDBLocalConfig;

      return {
        type: config.type,
        database: config.database,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
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
