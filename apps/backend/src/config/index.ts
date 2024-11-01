import { ConfigService } from '@nestjs/config';

export interface IAppConfig {
  project: string;
  application: string;
  version: string;
  description: string;
  port: number;
}

export default async (): Promise<IAppConfig> => {
  const configService = new ConfigService();

  const project = configService.get('PROJECT');
  const application = configService.get('APPLICATION');
  const version = configService.get('VERSION');
  const description = configService.get('DESCRIPTION');
  const port = configService.get('PORT');

  if (!project || !application || !version || !description || !port) {
    throw new Error('Missing required configuration values');
  }

  return Promise.resolve({
    project,
    application,
    version,
    description,
    port,
  });
};
