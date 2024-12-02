import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { UserInputError } from '@nestjs/apollo';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { Auth } from 'src/providers/auth/models/auth.model';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Action } from 'src/common/enums/action.enum';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';

@Resolver(() => Boolean)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean)
  async registerUser(
    @Args('RegisterUserDto') registerUserDto: RegisterUserDto,
  ): Promise<boolean> {
    let userRegistered: string;
    try {
      userRegistered = await this.authService.registerUser(registerUserDto);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return userRegistered !== null;
  }

  @Mutation(() => Auth)
  async loginUser(
    @Args('LoginUserDto') loginUserDto: LoginUserDto,
  ): Promise<Auth> {
    let auth: Auth;
    try {
      auth = await this.authService.authenticateUser(loginUserDto);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return auth;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Update,
    subject: 'User',
    conditions: { id: '{{ id }}' },
  })
  async changePassword(
    @Args('ChangePasswordDto') changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    let passwordUpdated: boolean;
    try {
      passwordUpdated =
        await this.authService.changePassword(changePasswordDto);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return passwordUpdated;
  }

  @Mutation(() => Boolean)
  forgotPassword(@Args('email') email: string): Promise<boolean> {
    return this.authService.forgotPassword(email);
  }

  async confirmForgotPassword(
    @Args('ConfirmForgotPasswordDto')
    confirmForgotPasswordDto: ConfirmForgotPasswordDto,
  ): Promise<boolean> {
    let passwordUpdated: boolean;
    try {
      passwordUpdated = await this.authService.confirmForgotPassword(
        confirmForgotPasswordDto,
      );
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return passwordUpdated;
  }
}
