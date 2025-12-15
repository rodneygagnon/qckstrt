import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PoliciesGuard } from './policies.guard';
import { CaslAbilityFactory } from '../../permissions/casl-ability.factory';
import { Action } from '../enums/action.enum';
import { Role } from 'src/common/enums/role.enum';

// Mock GqlExecutionContext
jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;
  let reflector: Reflector;
  let caslAbilityFactory: CaslAbilityFactory;

  const mockValidUser = {
    id: 'user-123',
    email: 'test@example.com',
    roles: [Role.User],
    department: 'Engineering',
    clearance: 'Secret',
  };

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    roles: [Role.Admin],
    department: 'IT',
    clearance: 'TopSecret',
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    caslAbilityFactory = {
      defineAbility: jest.fn(),
      replacePlaceholders: jest.fn((conditions) => conditions),
    } as unknown as CaslAbilityFactory;

    guard = new PoliciesGuard(reflector, caslAbilityFactory);
    jest.clearAllMocks();
  });

  const createMockContext = (
    headers: Record<string, string | undefined>,
    args: Record<string, unknown> = {},
  ) => {
    const mockRequest = { headers };
    const mockGqlContext = {
      getContext: () => ({ req: mockRequest }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      getArgs: () => args,
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockGqlContext);

    return {} as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no policies are defined', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
      const context = createMockContext({
        user: JSON.stringify(mockValidUser),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when policies is null/undefined', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(null);
      const context = createMockContext({
        user: JSON.stringify(mockValidUser),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when user header is null', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Read, subject: 'User' },
      ]);
      const context = createMockContext({ user: null as unknown as string });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user header is undefined string', async () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Read, subject: 'User' },
      ]);
      const context = createMockContext({ user: 'undefined' });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user is not logged in (missing required fields)', async () => {
      const invalidUser = { email: 'test@example.com' }; // missing id, roles, etc.
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Read, subject: 'User' },
      ]);
      const context = createMockContext({ user: JSON.stringify(invalidUser) });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should check policies for valid logged in user', async () => {
      const mockAbility = {
        can: jest.fn().mockReturnValue(true),
      };

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Read, subject: 'User' },
      ]);
      (caslAbilityFactory.defineAbility as jest.Mock).mockResolvedValue(
        mockAbility,
      );

      const context = createMockContext({
        user: JSON.stringify(mockValidUser),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(caslAbilityFactory.defineAbility).toHaveBeenCalled();
      expect(mockAbility.can).toHaveBeenCalledWith(Action.Read, 'User');
    });

    it('should return false when user lacks permission', async () => {
      const mockAbility = {
        can: jest.fn().mockReturnValue(false),
      };

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Delete, subject: 'User' },
      ]);
      (caslAbilityFactory.defineAbility as jest.Mock).mockResolvedValue(
        mockAbility,
      );

      const context = createMockContext({
        user: JSON.stringify(mockValidUser),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle multiple policies (all must pass)', async () => {
      const mockAbility = {
        can: jest
          .fn()
          .mockReturnValueOnce(true) // First policy passes
          .mockReturnValueOnce(false), // Second policy fails
      };

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        { action: Action.Read, subject: 'User' },
        { action: Action.Update, subject: 'User' },
      ]);
      (caslAbilityFactory.defineAbility as jest.Mock).mockResolvedValue(
        mockAbility,
      );

      const context = createMockContext({
        user: JSON.stringify(mockValidUser),
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle policies with conditions', async () => {
      const mockAbility = {
        can: jest.fn().mockReturnValue(true),
      };

      const policyWithConditions = {
        action: Action.Update,
        subject: 'User',
        conditions: { id: '{{id}}' },
      };

      (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
        policyWithConditions,
      ]);
      (caslAbilityFactory.defineAbility as jest.Mock).mockResolvedValue(
        mockAbility,
      );
      (caslAbilityFactory.replacePlaceholders as jest.Mock).mockReturnValue({
        id: 'user-123',
      });

      const context = createMockContext(
        { user: JSON.stringify(mockValidUser) },
        { id: 'user-123' },
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(caslAbilityFactory.replacePlaceholders).toHaveBeenCalled();
    });
  });
});
