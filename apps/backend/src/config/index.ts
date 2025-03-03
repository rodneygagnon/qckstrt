import { ConfigService } from '@nestjs/config';
import { getSecrets } from '../providers/secrets';
import { DBConnection, DBType } from 'src/common/enums/db.enums';

export interface IAuthConfig {
  userPoolId: string;
  clientId: string;
}

export interface IDBLocalConfig {
  type: DBType;
  database: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface IDBRemoteConfig {
  type: DBType;
  database: string;
  secretArn: string;
  resourceArn: number;
}

export interface IDBConfig {
  connection: DBConnection;
  config: IDBLocalConfig | IDBRemoteConfig;
}

export interface IFileConfig {
  bucket: string;
  sqsUrl: string;
  snsTopicArn: string;
  snsRoleArn: string;
}

export interface IAIConfig {
  apiKey: string;
  gptModel: string;
  embeddingModel: string;
  batchSize: number;
  chunkSize: number;
  chunkOverlap: number;
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
  ai: IAIConfig;
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

  const secrets = JSON.parse(
    await getSecrets(configService.get('AWS_SECRETS') || ''),
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
    db: secrets.db as IDBConfig,
    file: secrets.file as IFileConfig,
    ai: secrets.ai as IAIConfig,
  });
};
