import { getSecretValue } from './aws/aws.secrets';

export const getSecrets = async (secrets: string): Promise<string> =>
  Promise.resolve((await getSecretValue(secrets)) || '');
