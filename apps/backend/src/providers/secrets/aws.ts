import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
// import { ConfigService } from '@nestjs/config';

export const getSecretValue = async (secretId: string) => {
  // const configService = new ConfigService();

  const secretsManagerClient = new SecretsManagerClient(/*{
    region: configService.get('AWS_REGION'),
  }*/);

  const command = new GetSecretValueCommand({
    SecretId: secretId,
  });

  return (await secretsManagerClient.send(command)).SecretString;
};
