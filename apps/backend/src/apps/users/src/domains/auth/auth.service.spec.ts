/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { AuthService } from './auth.service';

import { UsersService } from '../user/users.service';

import {
  users,
  loginUserDto,
  registerUserDto,
  changePasswordDto,
  confirmForgotPasswordDto,
} from '../../../../data.spec';
import { IAuthProvider } from '@qckstrt/auth-provider';
import { Role } from 'src/common/enums/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let authProvider: IAuthProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: 'AUTH_PROVIDER', useValue: createMock<IAuthProvider>() },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    authProvider = module.get<IAuthProvider>('AUTH_PROVIDER');
  });

  it('services should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(authProvider).toBeDefined();
  });

  it('should register a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.registerUser = jest
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
    expect(authProvider.registerUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to register a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.registerUser = jest
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
      expect(authProvider.registerUser).toHaveBeenCalledTimes(1);
      expect(authProvider.addToGroup).toHaveBeenCalledTimes(0);
      expect(authProvider.confirmUser).toHaveBeenCalledTimes(0);
      expect(usersService.update).toHaveBeenCalledTimes(0);
    }
  });

  it('should fail to register a user due to bad cognito uuid', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.registerUser = jest
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
      expect(authProvider.registerUser).toHaveBeenCalledTimes(1);
      expect(authProvider.addToGroup).toHaveBeenCalledTimes(0);
      expect(authProvider.confirmUser).toHaveBeenCalledTimes(0);
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
      expect(authProvider.registerUser).toHaveBeenCalledTimes(0);
      expect(authProvider.addToGroup).toHaveBeenCalledTimes(0);
      expect(authProvider.confirmUser).toHaveBeenCalledTimes(0);
      expect(usersService.update).toHaveBeenCalledTimes(0);
    }
  });

  it('should log in a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.authenticateUser = jest
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
    expect(authProvider.authenticateUser).toHaveBeenCalledTimes(1);
  });

  it('should fail to log in a user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.authenticateUser = jest
      .fn()
      .mockImplementation((email: string, password: string) => {
        return Promise.reject(new Error('Failed user login!'));
      });

    try {
      await authService.authenticateUser(loginUserDto);
    } catch (error) {
      expect(error.message).toEqual('Failed user login!');
      expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
      expect(authProvider.authenticateUser).toHaveBeenCalledTimes(1);
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
      expect(authProvider.authenticateUser).toHaveBeenCalledTimes(0);
    }
  });

  it('should fail to log in a user', async () => {
    authProvider.changePassword = jest
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
      expect(authProvider.changePassword).toHaveBeenCalledTimes(1);
    }
  });

  it('should change a user password', async () => {
    authProvider.changePassword = jest
      .fn()
      .mockImplementation(
        (id: string, currentPassword: string, newPassword: string) => {
          return Promise.resolve(true);
        },
      );

    expect(await authService.changePassword(changePasswordDto)).toBe(true);
    expect(authProvider.changePassword).toHaveBeenCalledTimes(1);
  });

  it('should send forgot user password', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.forgotPassword = jest
      .fn()
      .mockImplementation((email: string) => {
        return Promise.resolve(true);
      });

    expect(await authService.forgotPassword(users[0].email)).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(authProvider.forgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should send forgot user password if user not found', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    expect(await authService.forgotPassword(users[0].email)).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(authProvider.forgotPassword).toHaveBeenCalledTimes(0);
  });

  it('should confirm forgot user password', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return users.find((user) => user.email === email);
    });
    authProvider.confirmForgotPassword = jest
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
    expect(authProvider.confirmForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should fail confirm forgot user password for unknown user', async () => {
    usersService.findByEmail = jest.fn().mockImplementation((email: string) => {
      return null;
    });

    expect(
      await authService.confirmForgotPassword(confirmForgotPasswordDto),
    ).toBe(true);
    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(authProvider.confirmForgotPassword).toHaveBeenCalledTimes(0);
  });

  it('should confirm user', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return users.find((user) => user.id === id);
    });
    authProvider.confirmUser = jest
      .fn()
      .mockImplementation((username: string) => {
        return Promise.resolve(true);
      });

    expect(await authService.confirmUser(users[0].id)).toBe(true);
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.confirmUser).toHaveBeenCalledTimes(1);
  });

  it('should fail confirm an unknown user', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return null;
    });

    expect(await authService.confirmUser(users[0].id)).toBe(false);
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.confirmUser).toHaveBeenCalledTimes(0);
  });

  it('should add permissions', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return users.find((user) => user.id === id);
    });
    authProvider.addToGroup = jest
      .fn()
      .mockImplementation((username: string, group: Role) => {
        return Promise.resolve(true);
      });

    expect(await authService.addPermission(users[0].id, Role.Admin)).toBe(true);
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.addToGroup).toHaveBeenCalledTimes(1);
  });

  it('should fail to add permissions for unknown user', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return null;
    });

    expect(await authService.addPermission(users[0].id, Role.Admin)).toBe(
      false,
    );
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.addToGroup).toHaveBeenCalledTimes(0);
  });

  it('should remove permissions', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return users.find((user) => user.id === id);
    });
    authProvider.removeFromGroup = jest
      .fn()
      .mockImplementation((username: string, group: Role) => {
        return Promise.resolve(true);
      });

    expect(await authService.removePermission(users[0].id, Role.Admin)).toBe(
      true,
    );
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.removeFromGroup).toHaveBeenCalledTimes(1);
  });

  it('should fail to remove permissions for unknown user', async () => {
    usersService.findById = jest.fn().mockImplementation((id: string) => {
      return null;
    });

    expect(await authService.removePermission(users[0].id, Role.Admin)).toBe(
      false,
    );
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(authProvider.removeFromGroup).toHaveBeenCalledTimes(0);
  });

  it('should delete a user', async () => {
    authProvider.deleteUser = jest
      .fn()
      .mockImplementation((username: string, group: Role) => {
        return Promise.resolve(true);
      });

    expect(await authService.deleteUser(users[0].email)).toBe(true);
    expect(authProvider.deleteUser).toHaveBeenCalledTimes(1);
  });
});
