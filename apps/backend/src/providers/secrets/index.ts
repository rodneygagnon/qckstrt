import { getSecretValue } from './aws';

export const getConfig = async (
  project: string,
  stage: string,
): Promise<string> =>
  Promise.resolve((await getSecretValue(`${project}-${stage}-secrets`)) || '');
