/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

import {
  changePasswordDto,
  confirmForgotPasswordDto,
  loginUserDto,
  registerUserDto,
} from '../../../../data.spec';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';
import { Role } from 'src/common/enums/role.enum';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: createMock<AuthService>() },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolver and services should be defined', () => {
    expect(resolver).toBeDefined();
    expect(authService).toBeDefined();
  });

  it('should register a user', async () => {
    authService.registerUser = jest
      .fn()
      .mockImplementation((registerUserDto: RegisterUserDto) => {
        return Promise.resolve(true);
      });

    expect(await resolver.registerUser(registerUserDto)).toEqual(true);
    expect(authService.registerUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to register a user', async () => {
    authService.registerUser = jest
      .fn()
      .mockImplementation((registerUserDto: RegisterUserDto) => {
        return Promise.reject(new Error('Failed user registration!'));
      });

    try {
      await resolver.registerUser(registerUserDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user registration!');
      expect(authService.registerUser).toHaveBeenCalledTimes(1);
    }
  });

  it('should log in a user', async () => {
    authService.authenticateUser = jest
      .fn()
      .mockImplementation((loginUserDto: LoginUserDto) => {
        return Promise.resolve({
          accessToken: 'qwerty',
          idToken: 'q1w2e3',
          refreshToken: '123456',
        });
      });

    expect(await resolver.loginUser(loginUserDto)).toEqual({
      accessToken: 'qwerty',
      idToken: 'q1w2e3',
      refreshToken: '123456',
    });
    expect(authService.authenticateUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to log in a user', async () => {
    authService.authenticateUser = jest
      .fn()
      .mockImplementation((loginUserDto: LoginUserDto) => {
        return Promise.reject(new Error('Failed user login!'));
      });

    try {
      await resolver.loginUser(loginUserDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user login!');
      expect(authService.authenticateUser).toHaveBeenCalledTimes(1);
    }
  });

  it('should change a user password', async () => {
    authService.changePassword = jest
      .fn()
      .mockImplementation((id: string, changePassword: ChangePasswordDto) => {
        return Promise.resolve(true);
      });

    expect(await resolver.changePassword(changePasswordDto)).toBe(true);
    expect(authService.changePassword).toHaveBeenCalledTimes(1);
  });

  it('should fail to change a user password', async () => {
    authService.changePassword = jest
      .fn()
      .mockImplementation((id: string, changePassword: ChangePasswordDto) => {
        return Promise.reject(new Error('Failed user password change!'));
      });

    try {
      await resolver.changePassword(changePasswordDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user password change!');
      expect(authService.changePassword).toHaveBeenCalledTimes(1);
    }
  });

  it('should send a forgot user password', async () => {
    authService.forgotPassword = jest
      .fn()
      .mockImplementation((email: string) => {
        return Promise.resolve(true);
      });

    expect(await resolver.forgotPassword('email')).toBe(true);
    expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should confirm a forgot user password', async () => {
    authService.confirmForgotPassword = jest
      .fn()
      .mockImplementation((confirmForgotPassword: ConfirmForgotPasswordDto) => {
        return Promise.resolve(true);
      });

    expect(await resolver.confirmForgotPassword(confirmForgotPasswordDto)).toBe(
      true,
    );
    expect(authService.confirmForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should fail to confirm a forgot user password', async () => {
    authService.confirmForgotPassword = jest
      .fn()
      .mockImplementation((confirmForgotPassword: ConfirmForgotPasswordDto) => {
        return Promise.reject(new Error('Failed forgot user password change!'));
      });

    try {
      await resolver.confirmForgotPassword(confirmForgotPasswordDto);
    } catch (error) {
      expect(error.message).toEqual('Failed forgot user password change!');
      expect(authService.confirmForgotPassword).toHaveBeenCalledTimes(1);
    }
  });

  it('should confirm a user', async () => {
    authService.confirmUser = jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(true);
    });

    expect(await resolver.confirmUser('1')).toBe(true);
    expect(authService.confirmUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to confirm an unknown user', async () => {
    authService.confirmUser = jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(false);
    });

    try {
      await resolver.confirmUser('1');
    } catch (error) {
      expect(error.message).toEqual('User not confirmed!');
      expect(authService.confirmUser).toHaveBeenCalledTimes(1);
    }
  });

  it('should fail to confirm a user due to error', async () => {
    authService.confirmForgotPassword = jest
      .fn()
      .mockImplementation((id: string) => {
        return Promise.reject(new Error('Failed confirm user!'));
      });

    try {
      await resolver.confirmUser('1');
    } catch (error) {
      expect(error.message).toEqual('Failed confirm user!');
      expect(authService.confirmUser).toHaveBeenCalledTimes(1);
    }
  });

  it('should add admin permissions', async () => {
    authService.addPermission = jest
      .fn()
      .mockImplementation((id: string, role: Role) => {
        return Promise.resolve(true);
      });

    expect(await resolver.addAdminPermission('1')).toBe(true);
    expect(authService.addPermission).toHaveBeenCalledTimes(1);
  });

  it('should fail to add admin permission to an unknown user', async () => {
    authService.addPermission = jest
      .fn()
      .mockImplementation((id: string, role: Role) => {
        return Promise.resolve(false);
      });

    try {
      await resolver.addAdminPermission('1');
    } catch (error) {
      expect(error.message).toEqual('Admin Permissions were not granted!');
      expect(authService.addPermission).toHaveBeenCalledTimes(1);
    }
  });

  it('should fail to add admin permission due to error', async () => {
    authService.addPermission = jest.fn().mockImplementation((id: string) => {
      return Promise.reject(new Error('Failed to add admin permissions!'));
    });

    try {
      await resolver.addAdminPermission('1');
    } catch (error) {
      expect(error.message).toEqual('Failed to add admin permissions!');
      expect(authService.addPermission).toHaveBeenCalledTimes(1);
    }
  });

  it('should remove admin permissions', async () => {
    authService.removePermission = jest
      .fn()
      .mockImplementation((id: string, role: Role) => {
        return Promise.resolve(true);
      });

    expect(await resolver.removeAdminPermission('1')).toBe(true);
    expect(authService.removePermission).toHaveBeenCalledTimes(1);
  });

  it('should fail to remove admin permission from an unknown user', async () => {
    authService.removePermission = jest
      .fn()
      .mockImplementation((id: string, role: Role) => {
        return Promise.resolve(false);
      });

    try {
      await resolver.removeAdminPermission('1');
    } catch (error) {
      expect(error.message).toEqual('Admin Permissions were not revoked!');
      expect(authService.removePermission).toHaveBeenCalledTimes(1);
    }
  });

  it('should fail to add admin permission due to error', async () => {
    authService.removePermission = jest
      .fn()
      .mockImplementation((id: string) => {
        return Promise.reject(new Error('Failed to revoke admin permissions!'));
      });

    try {
      await resolver.removeAdminPermission('1');
    } catch (error) {
      expect(error.message).toEqual('Failed to revoke admin permissions!');
      expect(authService.removePermission).toHaveBeenCalledTimes(1);
    }
  });
});
