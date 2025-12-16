import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from './auth.guard';

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
    jest.clearAllMocks();
  });

  const createMockContext = (headers: Record<string, string | undefined>) => {
    const mockRequest = { headers };
    const mockGqlContext = {
      getContext: () => ({ req: mockRequest }),
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

    return {} as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false when user header is null', async () => {
      const context = createMockContext({ user: null as unknown as string });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user header is undefined', async () => {
      const context = createMockContext({ user: undefined });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user header is string "undefined"', async () => {
      const context = createMockContext({ user: 'undefined' });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user header is not present', async () => {
      const context = createMockContext({});

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return true for valid logged in user', async () => {
      const validUser = JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        roles: ['User'],
        department: 'Engineering',
        clearance: 'Secret',
      });

      const context = createMockContext({ user: validUser });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false for invalid user JSON missing required fields', async () => {
      const invalidUser = JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        // missing roles, department, clearance
      });

      const context = createMockContext({ user: invalidUser });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false for user with only email', async () => {
      const partialUser = JSON.stringify({
        email: 'test@example.com',
      });

      const context = createMockContext({ user: partialUser });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false for malformed JSON in user header', async () => {
      const context = createMockContext({ user: 'not-valid-json' });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
