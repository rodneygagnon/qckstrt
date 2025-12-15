import { SetMetadata } from '@nestjs/common';
import { Subject as CaslSubject } from '@casl/ability';
import { Subject } from '../../permissions/casl-ability.factory';
import { Action } from 'src/common/enums/action.enum';

export interface RequiredPermissions<
  A extends string = Action,
  S extends CaslSubject = Subject,
> {
  action: A;
  subject: S;
  conditions?: Record<string, unknown>;
}

export const CHECK_PERMISSIONS = 'check_permissions';

export const Permissions = <
  A extends string = Action,
  S extends CaslSubject = Subject,
>(
  ...policies: RequiredPermissions<A, S>[]
) => SetMetadata(CHECK_PERMISSIONS, policies);
