import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Auth } from 'src/providers/auth/models/auth.model';

import { UsersService } from '../user/users.service';
import { AWSCognito } from 'src/providers/auth/aws.cognito';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(UsersService.name, { timestamp: true });

  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject() private awsCognito: AWSCognito,
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

    const userId = await this.awsCognito.registerUser(
      email,
      username,
      password,
      department,
      clearance,
    );

    const validUUID = /^[a-z,0-9,-]{36,36}$/;

    if (!validUUID.test(userId)) {
      const msg = `Can't register user <${registerUserDto.email}>. Invalid userId!`;
      this.logger.warn(msg);
      throw new Error(msg);
    }

    if (admin) {
      await this.awsCognito.adminUser(username);
    }

    if (confirm) {
      await this.awsCognito.confirmUser(username);
    }

    // Use AWS Cognito User ID as our ID
    await this.usersService.update(user.id, { id: userId });

    return userId;
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

    return this.awsCognito.authenticateUser(email, password);
  }

  async changePassword(
    changeUserPassword: ChangePasswordDto,
  ): Promise<boolean> {
    return this.awsCognito.changePassword(
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

    return this.awsCognito.forgotPassword(email);
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

    return this.awsCognito.confirmForgotPassword(
      confirmforgotPassword.email,
      confirmforgotPassword.password,
      confirmforgotPassword.confirmationCode,
    );
  }
}
