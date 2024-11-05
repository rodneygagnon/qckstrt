import { ConfigService } from '@nestjs/config';
import { getSecrets } from '../providers/secrets';

export interface IAppConfig {
  project: string;
  application: string;
  version: string;
  description: string;
  port: number;
  secrets: Map<string, string>;
}

export default async (): Promise<IAppConfig> => {
  const configService = new ConfigService();

  const project = configService.get('PROJECT');
  const application = configService.get('APPLICATION');
  const version = configService.get('VERSION');
  const description = configService.get('DESCRIPTION');
  const port = configService.get('PORT');

  if (!project || !application || !version || !description || !port) {
    throw new Error(
      `Missing required configuration values: project=${project} application=${application} version=${version} description=${description} port=${port}`,
    );
  }

  // Get Secrets. They should only be found in the .env in local dev environments.
  const secrets =
    configService.get<string>('SECRETS') ||
    (await getSecrets(project, configService.get('NODE_ENV') || 'dev'));

  if (!secrets) {
    throw new Error('Failed to access secrets');
  }

  return Promise.resolve({
    project,
    application,
    version,
    description,
    port,
    secrets: new Map<string, string>(Object.entries(JSON.parse(secrets))),
  });
};
