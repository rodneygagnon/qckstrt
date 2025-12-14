import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Auth } from './models/auth.model';

import { UsersService } from '../user/users.service';
import { IAuthProvider } from '@qckstrt/auth-provider';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(UsersService.name, { timestamp: true });

  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject('AUTH_PROVIDER') private authProvider: IAuthProvider,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<string> {
    const { email, username, password, department, clearance, admin, confirm } =
      registerUserDto;

    // Find user by email first to make sure they were created
    // FUTURE NOTE: think about storing auth strategy/provider in user db ...

    const user = await this.usersService.findByEmail(email);

    if (user?.email !== registerUserDto.email) {
      const msg = `Can't register user <${registerUserDto.email}>. User does not exist!`;
      this.logger.warn(msg);
      throw new Error(msg);
    }

    const userId = await this.authProvider.registerUser({
      email,
      username,
      password,
      attributes: {
        department: department || 'N/A',
        clearance: clearance || 'N/A',
      },
    });

    const validUUID = /^[a-z,0-9,-]{36,36}$/;

    if (!validUUID.test(userId)) {
      const msg = `Can't register user <${registerUserDto.email}>. Invalid userId!`;
      this.logger.warn(msg);
      throw new Error(msg);
    }

    if (admin) {
      await this.authProvider.addToGroup(username, Role.Admin);
    }

    if (confirm) {
      await this.authProvider.confirmUser(username);
    }

    // Use AWS Cognito User ID as our ID
    await this.usersService.update(user.id, { id: userId });

    return userId;
  }

  async confirmUser(id: string): Promise<boolean> {
    const user = await this.usersService.findById(id);

    if (user === null) {
      return Promise.resolve(false);
    }

    await this.authProvider.confirmUser(user.email);

    return Promise.resolve(true);
  }

  async addPermission(id: string, role: Role): Promise<boolean> {
    const user = await this.usersService.findById(id);

    if (user === null) {
      return Promise.resolve(false);
    }

    await this.authProvider.addToGroup(user.email, role);

    return Promise.resolve(true);
  }

  async removePermission(id: string, role: Role): Promise<boolean> {
    const user = await this.usersService.findById(id);

    if (user === null) {
      return Promise.resolve(false);
    }

    await this.authProvider.removeFromGroup(user.email, role);

    return Promise.resolve(true);
  }

  async deleteUser(username: string): Promise<boolean> {
    return this.authProvider.deleteUser(username);
  }

  async authenticateUser(loginUserDto: LoginUserDto): Promise<Auth> {
    const { email, password } = loginUserDto;

    // Find user by email first to make sure they were created
    // NOTE: think about storing auth strategy in user db ...

    const user = await this.usersService.findByEmail(email);

    if (user?.email !== loginUserDto.email) {
      const msg = `Can't register user <${loginUserDto.email}>. User does not exist!`;
      this.logger.warn(msg);
      throw new Error(msg);
    }

    return this.authProvider.authenticateUser(email, password);
  }

  async changePassword(
    changeUserPassword: ChangePasswordDto,
  ): Promise<boolean> {
    return this.authProvider.changePassword(
      changeUserPassword.accessToken,
      changeUserPassword.newPassword,
      changeUserPassword.currentPassword,
    );
  }

  async forgotPassword(email: string): Promise<boolean> {
    // If user is not found, don't send failure as that could let hackers know which emails do exist
    const user = await this.usersService.findByEmail(email);

    if (user === null) {
      return Promise.resolve(true);
    }

    return this.authProvider.forgotPassword(email);
  }

  async confirmForgotPassword(
    confirmforgotPassword: ConfirmForgotPasswordDto,
  ): Promise<boolean> {
    // If user is not found, don't send failure as that could let hackers know which emails do exist
    const user = await this.usersService.findByEmail(
      confirmforgotPassword.email,
    );

    if (user === null) {
      return Promise.resolve(true);
    }

    return this.authProvider.confirmForgotPassword(
      confirmforgotPassword.email,
      confirmforgotPassword.password,
      confirmforgotPassword.confirmationCode,
    );
  }
}
