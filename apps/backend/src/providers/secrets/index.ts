import { getSecretValue } from './aws';

export const getSecrets = async (secrets: string): Promise<string> =>
  Promise.resolve((await getSecretValue(secrets)) || '');
