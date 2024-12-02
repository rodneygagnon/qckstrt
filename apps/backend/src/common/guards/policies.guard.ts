/* eslint-disable @typescript-eslint/no-explicit-any */
import { subject as an, Subject as CaslSubject } from '@casl/ability';
import {
  CHECK_PERMISSIONS,
  RequiredPermissions,
} from '../decorators/permissions.decorator';
import {
  CaslAbilityFactory,
  Subject,
} from '../../permissions/casl-ability.factory';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { cloneDeep, isEmpty } from 'lodash';

import { ILogin } from 'src/interfaces/login.interface';
import { isLoggedIn } from 'src/providers/auth/jwt.strategy';

import { Action } from '../enums/action.enum';

import { IPolicy } from 'src/interfaces/policy.interface';
import { IUserPolicies } from 'src/interfaces/user.interface';

interface IPermissions {
  subject: string;
  policies: IPolicy[];
}

export const permissions: IPermissions[] = [
  { subject: 'User', policies: IUserPolicies },
];

@Injectable()
export class PoliciesGuard<
  A extends string = Action,
  S extends CaslSubject = Subject,
> implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    @Inject(CaslAbilityFactory)
    private caslAbilityFactory: CaslAbilityFactory<A, S>,
  ) {}

  /**
   * Main method that determines if the current request can proceed based on defined policies.
   * @param context - The execution context, containing the request and response objects.
   * @returns A boolean indicating whether the request is allowed.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    // Retrieve policies defined for the route handler and class
    const requiredPolicies =
      this.reflector.getAllAndOverride<RequiredPermissions<A, S>[]>(
        CHECK_PERMISSIONS,
        [ctx.getHandler(), ctx.getClass()],
      ) || [];

    if (isEmpty(requiredPolicies)) {
      return Promise.resolve(true);
    }

    const request = ctx.getContext().req;
    const args = ctx.getArgs();

    if (
      request.headers.user != null &&
      request.headers.user !== 'undefined' &&
      (await isLoggedIn(JSON.parse(request.headers.user)))
    ) {
      const user: ILogin = JSON.parse(request.headers.user);

      // Define the abilities based on the user's policies
      const ability = await this.caslAbilityFactory.defineAbility(
        permissions,
        user,
      );

      const conditionContext: Record<string, any> = {};

      // Set the context for the policies
      for (const policy of requiredPolicies) {
        conditionContext[policy.subject as string] = !isEmpty(policy.conditions)
          ? this.caslAbilityFactory.replacePlaceholders(
              cloneDeep(policy.conditions),
              args,
            )
          : undefined;
      }

      // Check if all policies are satisfied
      return this.checkPolicies(requiredPolicies, ability, conditionContext);
    }

    return Promise.resolve(false);
  }

  /**
   * Checks if all policies are satisfied based on the abilities and condition context.
   * @param policies - The array of policies to be checked.
   * @param ability - The ability object that checks permissions.
   * @param conditionContext - The context object containing fetched entities.
   * @returns A boolean indicating whether all policies are satisfied.
   */
  private checkPolicies(
    policies: RequiredPermissions<A, S>[],
    abilities: any,
    conditionContext: Record<string, any>,
  ): boolean {
    return policies.every((policy) => {
      const subject: string = policy.subject as string;
      return abilities.can(
        policy.action,
        conditionContext[subject]
          ? an(subject, conditionContext[subject])
          : policy.subject,
      );
    });
  }
}
