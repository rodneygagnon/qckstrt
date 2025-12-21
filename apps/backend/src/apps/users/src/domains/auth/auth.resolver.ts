import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { UserInputError } from '@nestjs/apollo';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { Auth } from './models/auth.model';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Action } from 'src/common/enums/action.enum';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';

@Resolver(() => Boolean)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean)
  async registerUser(
    @Args('registerUserDto') registerUserDto: RegisterUserDto,
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
    @Args('loginUserDto') loginUserDto: LoginUserDto,
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
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
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

  @Mutation(() => Boolean)
  async confirmForgotPassword(
    @Args('confirmForgotPasswordDto')
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

  /** Administration */
  @Mutation(() => Boolean)
  @Roles(Role.Admin)
  async confirmUser(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.authService.confirmUser(id);
    if (!result) throw new UserInputError('User not confirmed!');
    return result;
  }

  @Mutation(() => Boolean)
  @Roles(Role.Admin)
  async addAdminPermission(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.authService.addPermission(id, Role.Admin);
    if (!result)
      throw new UserInputError('Admin Permissions were not granted!');
    return result;
  }

  @Mutation(() => Boolean)
  @Roles(Role.Admin)
  async removeAdminPermission(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.authService.removePermission(id, Role.Admin);
    if (!result)
      throw new UserInputError('Admin Permissions were not revoked!');
    return result;
  }
}
