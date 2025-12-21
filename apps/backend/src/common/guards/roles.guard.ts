import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

import { ILogin } from 'src/interfaces/login.interface';
import { isLoggedIn } from 'src/common/auth/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    if (
      request.headers.user != null &&
      request.headers.user !== 'undefined' &&
      (await isLoggedIn(JSON.parse(request.headers.user)))
    ) {
      const user: ILogin = JSON.parse(request.headers.user);

      return requiredRoles.some((role) => user.roles?.includes(role));
    }

    return false;
  }
}
