import { Action } from '../common/enums/action.enum';
import { Effect } from '../common/enums/effect.enum';

export interface IPolicy {
  effect: Effect;
  actions: Action[];
  subjects: string[];
  fields: string[];
  conditions: { [name: string]: string };
}
