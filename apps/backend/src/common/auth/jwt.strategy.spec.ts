import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, isLoggedIn } from './jwt.strategy';
import { ILogin } from 'src/interfaces/login.interface';

describe('isLoggedIn', () => {
  it('should return true for valid login object', () => {
    const validLogin: ILogin = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['User'],
      department: 'Engineering',
      clearance: 'Secret',
    };

    expect(isLoggedIn(validLogin)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isLoggedIn(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLoggedIn(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isLoggedIn('string')).toBe(false);
    expect(isLoggedIn(123)).toBe(false);
    expect(isLoggedIn(true)).toBe(false);
  });

  it('should return false for object missing email', () => {
    const invalidLogin = {
      id: 'user-123',
      roles: ['User'],
      department: 'Engineering',
      clearance: 'Secret',
    };

    expect(isLoggedIn(invalidLogin)).toBe(false);
  });

  it('should return false for object missing id', () => {
    const invalidLogin = {
      email: 'test@example.com',
      roles: ['User'],
      department: 'Engineering',
      clearance: 'Secret',
    };

    expect(isLoggedIn(invalidLogin)).toBe(false);
  });

  it('should return false for object missing roles', () => {
    const invalidLogin = {
      id: 'user-123',
      email: 'test@example.com',
      department: 'Engineering',
      clearance: 'Secret',
    };

    expect(isLoggedIn(invalidLogin)).toBe(false);
  });

  it('should return false for object missing department', () => {
    const invalidLogin = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['User'],
      clearance: 'Secret',
    };

    expect(isLoggedIn(invalidLogin)).toBe(false);
  });

  it('should return false for object missing clearance', () => {
    const invalidLogin = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['User'],
      department: 'Engineering',
    };

    expect(isLoggedIn(invalidLogin)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isLoggedIn({})).toBe(false);
  });
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockAuthConfig = {
    userPoolId: 'us-east-1_testPool',
    clientId: 'test-client-id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'auth':
                  return mockAuthConfig;
                case 'region':
                  return 'us-east-1';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should throw error when auth config is missing', () => {
    const badConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(badConfigService)).toThrow(
      'Authentication config is missing',
    );
  });

  describe('validate', () => {
    beforeEach(() => {
      // Mock passportJwtSecret to avoid actual JWKS calls
      jest.mock('jwks-rsa', () => ({
        passportJwtSecret: jest.fn().mockReturnValue(() => 'mock-secret'),
      }));

      strategy = new JwtStrategy(configService);
    });

    it('should transform JWT payload to ILogin', async () => {
      const payload = {
        sub: 'user-uuid-123',
        email: 'test@example.com',
        'cognito:groups': ['Admin', 'User'],
        'custom:department': 'Engineering',
        'custom:clearance': 'TopSecret',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        roles: ['Admin', 'User'],
        department: 'Engineering',
        clearance: 'TopSecret',
      });
    });

    it('should handle missing cognito:groups with empty array', async () => {
      const payload = {
        sub: 'user-uuid-123',
        email: 'test@example.com',
        'custom:department': 'Engineering',
        'custom:clearance': 'Secret',
      };

      const result = await strategy.validate(payload);

      expect(result.roles).toEqual([]);
    });

    it('should handle undefined custom attributes', async () => {
      const payload = {
        sub: 'user-uuid-123',
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        roles: [],
        department: undefined,
        clearance: undefined,
      });
    });
  });
});
