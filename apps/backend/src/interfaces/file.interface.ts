import { Effect } from '../common/enums/effect.enum';
import { IPolicy } from './policy.interface';
import { Action } from '../common/enums/action.enum';

export interface IFile {
  userId: string;
  filename: string;
  size: number;
  lastModified: Date;
}

export const IFilePolicies: IPolicy[] = [
  {
    effect: Effect.Allow,
    actions: [Action.Create, Action.Read, Action.Update],
    subjects: ['File'],
    fields: [],
    conditions: {
      userId: '{{userId}}',
    },
  },
];
