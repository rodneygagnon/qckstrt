import { Effect } from '../common/enums/effect.enum';
import { IPolicy } from './policy.interface';
import { Action } from '../common/enums/action.enum';
import { DocumentStatus } from 'src/common/enums/document.status.enum';

export interface IFile {
  userId: string;
  filename: string;
  size: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const IFilePolicies: IPolicy[] = [
  {
    effect: Effect.Allow,
    actions: [Action.Create, Action.Read, Action.Update, Action.Delete],
    subjects: ['File'],
    fields: [],
    conditions: {
      userId: '{{id}}',
    },
  },
];
