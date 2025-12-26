import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * GraphQL-aware Throttler Guard
 *
 * Extends the default ThrottlerGuard to work with GraphQL context.
 * Extracts the HTTP request and response from GraphQL execution context.
 * For federated subgraphs, the request may come from the gateway without
 * a full HTTP context, so we create a mock response if needed.
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

    // For federated subgraphs, req/res may not be available
    // Create mock objects if needed for throttler compatibility
    const req = ctx.req || { ip: '127.0.0.1', headers: {} };
    const res = ctx.res || {
      header: () => res,
      setHeader: () => res,
    };

    return { req, res };
  }
}
