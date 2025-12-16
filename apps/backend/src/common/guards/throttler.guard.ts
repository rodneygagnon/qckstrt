import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * GraphQL-aware Throttler Guard
 *
 * Extends the default ThrottlerGuard to work with GraphQL context.
 * Extracts the HTTP request and response from GraphQL execution context.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  /**
   * Get the request object from the execution context.
   * For GraphQL, we need to extract it from the GQL context.
   */
  protected getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    // GraphQL context contains req and res from Express
    return { req: ctx.req, res: ctx.res };
  }
}
