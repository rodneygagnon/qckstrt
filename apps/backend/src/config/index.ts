import { ConfigService } from '@nestjs/config';
import { getSecrets } from '../providers/secrets';

export interface IAuthConfig {
  userPoolId: string;
  clientId: string;
}

export interface IDBConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface IFileConfig {
  maxFieldSize: number;
  maxFileSize: number;
  maxFiles: number;
  bucket: string;
}

export interface IAppConfig {
  project: string;
  application: string;
  version: string;
  description: string;
  port: number;
  region: string;
  apiKeys: Map<string, string>;
  auth: IAuthConfig;
  db: IDBConfig;
  file: IFileConfig;
}

export default async (): Promise<IAppConfig> => {
  const configService = new ConfigService();

  const project = configService.get('PROJECT');
  const application = configService.get('APPLICATION');
  const version = configService.get('VERSION');
  const description = configService.get('DESCRIPTION');
  const port = configService.get('PORT');
  const region = configService.get('AWS_REGION');

  if (
    !project ||
    !application ||
    !version ||
    !description ||
    !port ||
    !region
  ) {
    throw new Error(
      `Missing service configuration: PROJECT=${project} APPLICATION=${application} VERSION=${version} DESCRIPTION=${description} PORT=${port} AWS_REGION=${region}`,
    );
  }

  const dbHost = configService.get('DB_HOST');
  const dbPort = configService.get('DB_PORT');
  const dbUsername = configService.get('DB_USERNAME');
  const dbPassword = configService.get('DB_PASSWORD');
  const dbDatabase = configService.get('DB_DATABASE');

  if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbDatabase) {
    throw new Error(
      `Missing required database configuration: DB_HOST=${dbHost} DB_PORT=${dbPort} DB_USERNAME=${dbUsername} DB_PASSWORD=${dbPassword} DB_DATABASE=${dbDatabase}`,
    );
  }

  const maxFieldSize = configService.get('FILE_MAXFIELDSIZE') || 10000000; // 1MB
  const maxFileSize = configService.get('FILE_MAXFILESIZE') || 100000000; // 10MB
  const maxFiles = configService.get('FILE_MAXFILES') || 10; // 10 Files
  const bucket = configService.get('FILE_BUCKET') || 'qckstrt-dev-bucket';

  // Get Secrets. They should only be found in the .env in local dev environments.
  const envSecrets = configService.get('SECRETS');
  const secrets = JSON.parse(
    envSecrets && envSecrets !== ''
      ? envSecrets
      : await getSecrets(project, configService.get('NODE_ENV') || 'dev'),
  );

  if (!secrets) {
    throw new Error('Failed to access secrets');
  }

  return Promise.resolve({
    project,
    application,
    version,
    description,
    port,
    region,
    apiKeys: new Map<string, string>(Object.entries(secrets.apiKeys)),
    auth: secrets.auth as IAuthConfig,
    db: {
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: dbDatabase,
    },
    file: {
      maxFieldSize,
      maxFileSize,
      maxFiles,
      bucket,
    },
  });
};
