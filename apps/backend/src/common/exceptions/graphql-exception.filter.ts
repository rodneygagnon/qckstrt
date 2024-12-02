import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

// Custorm Graphql exception filter
@Catch(GraphQLError)
export class GraphQLExceptionFilter implements ExceptionFilter {
  catch(exception: GraphQLError, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const request = ctx.req;

    const errorReturn = new GraphQLError(exception.message, {
      extensions: {
        code: exception.extensions?.code || 500,
        timestamp: new Date().toISOString(),
        path:
          gqlHost.getInfo()?.fieldName || request?.originalUrl || request?.url,
      },
    });

    // Return a formatted error response
    return errorReturn;
  }
}
