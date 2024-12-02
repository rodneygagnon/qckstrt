/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { AuthService } from './auth.service';

import { UsersService } from '../user/users.service';
import { User } from '../user/models/user.model';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

import {
  users,
  loginUserDto,
  registerUserDto,
  changePasswordDto,
  confirmForgotPasswordDto,
} from '../data.spec';
import { AWSCognito } from 'src/providers/auth/aws.cognito';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let awsCognito: AWSCognito;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: AWSCognito, useValue: createMock<AWSCognito>() },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    awsCognito = module.get<AWSCognito>(AWSCognito);
  });

  it('services should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(awsCognito).toBeDefined();
  });

  it('should register a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.registerUser = jest
      .fn()
      .mockImplementation(
        (email: string, username: string, password: string) => {
          return Promise.resolve('0919390e-9061-70c5-6a92-2a0b70b204e7');
        },
      );

    expect(await authService.registerUser(registerUserDto)).toEqual(
      '0919390e-9061-70c5-6a92-2a0b70b204e7',
    );
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.registerUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to register a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.registerUser = jest
      .fn()
      .mockImplementation(
        (email: string, username: string, password: string) => {
          return Promise.reject(new Error('User already exists!'));
        },
      );

    try {
      await authService.registerUser(registerUserDto);
    } catch (error) {
      expect(error.message).toEqual('User already exists!');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(awsCognito.registerUser).toHaveBeenCalledTimes(1);
      expect(awsCognito.adminUser).toHaveBeenCalledTimes(0);
      expect(awsCognito.confirmUser).toHaveBeenCalledTimes(0);
      expect(usersService.update).toHaveBeenCalledTimes(0);
    }
  });

  it('should fail to register a user due to bad cognito uuid', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.registerUser = jest
      .fn()
      .mockImplementation(
        (email: string, username: string, password: string) => {
          return Promise.resolve('bad-id');
        },
      );

    try {
      await authService.registerUser(registerUserDto);
    } catch (error) {
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(awsCognito.registerUser).toHaveBeenCalledTimes(1);
      expect(awsCognito.adminUser).toHaveBeenCalledTimes(0);
      expect(awsCognito.confirmUser).toHaveBeenCalledTimes(0);
      expect(usersService.update).toHaveBeenCalledTimes(0);
    }
  });

  it('should fail to register an unknown user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    try {
      await authService.registerUser(registerUserDto);
    } catch (error) {
      expect(error.message).toContain('User does not exist!');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(awsCognito.registerUser).toHaveBeenCalledTimes(0);
      expect(awsCognito.adminUser).toHaveBeenCalledTimes(0);
      expect(awsCognito.confirmUser).toHaveBeenCalledTimes(0);
      expect(usersService.update).toHaveBeenCalledTimes(0);
    }
  });

  it('should log in a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.authenticateUser = jest
      .fn()
      .mockImplementation((email: string, password: string) => {
        return Promise.resolve({
          accessToken: 'qwerty',
          refreshToken: '123456',
        });
      });

    expect(await authService.authenticateUser(loginUserDto)).toEqual({
      accessToken: 'qwerty',
      refreshToken: '123456',
    });
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.authenticateUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to log in a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.authenticateUser = jest
      .fn()
      .mockImplementation((email: string, password: string) => {
        return Promise.reject(new Error('Failed user login!'));
      });

    try {
      await authService.authenticateUser(loginUserDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user login!');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(awsCognito.authenticateUser).toHaveBeenCalledTimes(1);
    }
  });

  it('should fail to log in an unknown user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    try {
      await authService.authenticateUser(loginUserDto);
    } catch (error) {
      expect(error.message).toContain('User does not exist!');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(awsCognito.authenticateUser).toHaveBeenCalledTimes(0);
    }
  });

  it('should fail to log in a user', async () => {
    awsCognito.changePassword = jest
      .fn()
      .mockImplementation(
        (id: string, currentPassword: string, newPassword: string) => {
          return Promise.reject(new Error('Failed user password change!'));
        },
      );

    try {
      await authService.changePassword(changePasswordDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user password change!');
      expect(awsCognito.changePassword).toHaveBeenCalledTimes(1);
    }
  });

  it('should change a user password', async () => {
    awsCognito.changePassword = jest
      .fn()
      .mockImplementation(
        (id: string, currentPassword: string, newPassword: string) => {
          return Promise.resolve(true);
        },
      );

    expect(await authService.changePassword(changePasswordDto)).toBe(true);
    expect(awsCognito.changePassword).toHaveBeenCalledTimes(1);
  });

  it('should send forgot user password', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.forgotPassword = jest
      .fn()
      .mockImplementation((email: string) => {
        return Promise.resolve(true);
      });

    expect(await authService.forgotPassword(users[0].email)).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.forgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should send forgot user password if user not found', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    expect(await authService.forgotPassword(users[0].email)).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.forgotPassword).toHaveBeenCalledTimes(0);
  });

  it('should confirm forgot user password', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    awsCognito.confirmForgotPassword = jest
      .fn()
      .mockImplementation(
        (email: string, password: string, confirmationCode: string) => {
          return Promise.resolve(true);
        },
      );

    expect(
      await authService.confirmForgotPassword(confirmForgotPasswordDto),
    ).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.confirmForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should fail confirm forgot user password for unknown user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    expect(
      await authService.confirmForgotPassword(confirmForgotPasswordDto),
    ).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(awsCognito.confirmForgotPassword).toHaveBeenCalledTimes(0);
  });
});
