import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlThrottlerGuard } from './throttler.guard';
import { Reflector } from '@nestjs/core';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('GqlThrottlerGuard', () => {
  let guard: GqlThrottlerGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockStorage: jest.Mocked<ThrottlerStorage>;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    mockStorage = {
      increment: jest.fn(),
    } as unknown as jest.Mocked<ThrottlerStorage>;

    const options: ThrottlerModuleOptions = [
      { name: 'default', ttl: 60000, limit: 10 },
    ];

    guard = new GqlThrottlerGuard(options, mockStorage, mockReflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRequestResponse', () => {
    it('should extract request and response from GraphQL context', () => {
      const mockReq = { ip: '127.0.0.1', headers: {} };
      const mockRes = { setHeader: jest.fn() };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({
          req: mockReq,
          res: mockRes,
        }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const mockExecutionContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Access the protected method via type assertion
      const guardWithAccess = guard as unknown as {
        getRequestResponse: (ctx: ExecutionContext) => {
          req: unknown;
          res: unknown;
        };
      };
      const result = guardWithAccess.getRequestResponse(mockExecutionContext);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(
        mockExecutionContext,
      );
      expect(mockGqlContext.getContext).toHaveBeenCalled();
      expect(result).toEqual({ req: mockReq, res: mockRes });
    });

    it('should handle context with undefined response', () => {
      const mockReq = { ip: '127.0.0.1', headers: {} };

      const mockGqlContext = {
        getContext: jest.fn().mockReturnValue({
          req: mockReq,
          res: undefined,
        }),
      };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

      const mockExecutionContext = {} as ExecutionContext;

      const guardWithAccess = guard as unknown as {
        getRequestResponse: (ctx: ExecutionContext) => {
          req: unknown;
          res: unknown;
        };
      };
      const result = guardWithAccess.getRequestResponse(mockExecutionContext);

      expect(result).toEqual({ req: mockReq, res: undefined });
    });
  });
});
