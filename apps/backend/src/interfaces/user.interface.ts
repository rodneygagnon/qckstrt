import { Effect } from '../common/enums/effect.enum';
import { IPolicy } from './policy.interface';
import { Action } from '../common/enums/action.enum';

export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const IUserPolicies: IPolicy[] = [
  {
    effect: Effect.Allow,
    actions: [Action.Read, Action.Update],
    subjects: ['User'],
    fields: [],
    conditions: {
      id: '{{id}}',
    },
  },
];
