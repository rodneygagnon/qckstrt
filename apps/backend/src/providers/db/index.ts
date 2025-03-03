import { DataSourceOptions } from 'typeorm';

interface DbEntityConfig {
  entities: DataSourceOptions['entities'];
}

import { IDBConfig } from 'src/config';
import { DBConnection } from 'src/common/enums/db.enums';

import { IDBLocalConfig, IDBRemoteConfig } from 'src/config';

export const getConnectionOptions = (
  region: string,
  dbConfig: IDBConfig,
  dbEntityConfig: DbEntityConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const baseOptions = {
    keepConnectionAlive: true,
    ssl:
      /* (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'test')
        ? { rejectUnauthorized: false } : */
      false,
    entities: dbEntityConfig.entities,
    synchronize: true,
    logging: false,
  };

  if (dbConfig.connection === DBConnection.Remote) {
    const config = dbConfig.config as IDBRemoteConfig;

    return {
      ...baseOptions,
      type: config.type,
      database: config.database,
      secretArn: config.secretArn,
      resourceArn: config.resourceArn,
      region,
      serviceConfigOptions: {
        // additional options to pass to the aws-sdk RDS client
      },
      formatOptions: {
        // additional format options to pass to the Data API client
        enableUuidHack: true,
      },
    };
  } else {
    const config = dbConfig.config as IDBLocalConfig;

    return {
      ...baseOptions,
      type: config.type,
      database: config.database,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    };
  }
};
