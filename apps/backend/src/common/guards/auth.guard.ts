import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isLoggedIn } from 'src/common/auth/jwt.strategy';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Null, undefined or equal to 'undefined' string
    if (request.headers.user == null || request.headers.user === 'undefined') {
      return false;
    }

    try {
      const user = JSON.parse(request.headers.user);
      return isLoggedIn(user);
    } catch {
      // Malformed JSON in user header
      return false;
    }
  }
}
