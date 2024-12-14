import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminAddUserToGroupCommand,
  AdminConfirmSignUpCommand,
  AdminDeleteUserCommand,
  AdminRemoveUserFromGroupCommand,
  AuthFlowType,
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import { Auth } from './models/auth.model';
import { IAuthConfig } from 'src/config';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AWSCognito {
  private client: CognitoIdentityProviderClient;
  private authConfig: IAuthConfig;

  constructor(private configService: ConfigService) {
    const authConfig: IAuthConfig | undefined =
      configService.get<IAuthConfig>('auth');

    if (!authConfig) {
      throw new Error('Authentication config is missing');
    }

    this.authConfig = authConfig;
    this.client = new CognitoIdentityProviderClient({
      region: configService.get<string>('region'),
    });
  }

  async registerUser(
    email: string,
    username: string,
    password: string,
    department: string = 'N/A',
    clearance: string = 'N/A',
  ): Promise<string> {
    const signupCommand = new SignUpCommand({
      ClientId: this.authConfig.clientId,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'custom:department', Value: department },
        { Name: 'custom:clearance', Value: clearance },
      ],
    });
    const signUpResponse = await this.client.send(signupCommand);

    return Promise.resolve(signUpResponse.UserSub || 'unknown');
  }

  async addToGroup(username: string, group: Role): Promise<void> {
    const groupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: this.authConfig.userPoolId,
      Username: username,
      GroupName: group,
    });
    await this.client.send(groupCommand);
  }

  async removeFromGroup(username: string, group: Role): Promise<void> {
    const groupCommand = new AdminRemoveUserFromGroupCommand({
      UserPoolId: this.authConfig.userPoolId,
      Username: username,
      GroupName: group,
    });
    await this.client.send(groupCommand);
  }

  async confirmUser(username: string): Promise<void> {
    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: this.authConfig.userPoolId,
      Username: username,
    });
    await this.client.send(confirmCommand);
  }

  async deleteUser(username: string): Promise<boolean> {
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: this.authConfig.userPoolId,
      Username: username,
    });

    await this.client.send(deleteCommand);

    return Promise.resolve(true);
  }

  async authenticateUser(email: string, password: string): Promise<Auth> {
    const authCommand = new InitiateAuthCommand({
      ClientId: this.authConfig.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });
    const response = await this.client.send(authCommand);

    return Promise.resolve({
      accessToken: response.AuthenticationResult?.AccessToken || '',
      idToken: response.AuthenticationResult?.IdToken || '',
      refreshToken: response.AuthenticationResult?.RefreshToken || '',
      expiresIn: response.AuthenticationResult?.ExpiresIn || 0,
    });
  }

  async changePassword(
    accessToken: string,
    newPassword: string,
    currentPassword: string,
  ): Promise<boolean> {
    const changePasswordCommand = new ChangePasswordCommand({
      AccessToken: accessToken,
      ProposedPassword: newPassword,
      PreviousPassword: currentPassword,
    });

    await this.client.send(changePasswordCommand);

    return Promise.resolve(true);
  }

  async forgotPassword(username: string): Promise<boolean> {
    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: this.authConfig.clientId,
      Username: username,
    });

    await this.client.send(forgotPasswordCommand);

    return Promise.resolve(true);
  }

  async confirmForgotPassword(
    username: string,
    password: string,
    confirmationCode: string,
  ): Promise<boolean> {
    const confirmFirgotPasswordCommand = new ConfirmForgotPasswordCommand({
      ClientId: this.authConfig.clientId,
      Username: username,
      Password: password,
      ConfirmationCode: confirmationCode,
    });
    await this.client.send(confirmFirgotPasswordCommand);

    return Promise.resolve(true);
  }
}
