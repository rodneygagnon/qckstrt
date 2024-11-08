import { getSecretValue } from './aws';

export const getSecrets = async (
  project: string,
  stage: string,
): Promise<string> =>
  Promise.resolve((await getSecretValue(`${project}-${stage}-keys`)) || '');
