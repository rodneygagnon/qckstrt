import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
} from "@aws-sdk/client-cognito-identity-provider";
import {
  IAuthProvider,
  IAuthConfig,
  IAuthResult,
  IRegisterUserInput,
  AuthError,
} from "@qckstrt/common";

/**
 * AWS Cognito Auth Provider
 *
 * Implements authentication operations using AWS Cognito.
 */
@Injectable()
export class CognitoAuthProvider implements IAuthProvider {
  private readonly logger = new Logger(CognitoAuthProvider.name, {
    timestamp: true,
  });
  private readonly client: CognitoIdentityProviderClient;
  private readonly authConfig: IAuthConfig;

  constructor(private configService: ConfigService) {
    const region = configService.get<string>("region") || "us-east-1";
    const userPoolId = configService.get<string>("auth.userPoolId");
    const clientId = configService.get<string>("auth.clientId");

    if (!userPoolId || !clientId) {
      throw new AuthError(
        "Auth configuration is missing userPoolId or clientId",
        "CONFIG_ERROR",
      );
    }

    this.authConfig = {
      region,
      userPoolId,
      clientId,
      clientSecret: configService.get<string>("auth.clientSecret"),
    };

    this.client = new CognitoIdentityProviderClient({ region });

    this.logger.log(`CognitoAuthProvider initialized for region: ${region}`);
  }

  getName(): string {
    return "CognitoAuthProvider";
  }

  async registerUser(input: IRegisterUserInput): Promise<string> {
    try {
      const userAttributes = [{ Name: "email", Value: input.email }];

      // Add custom attributes if provided
      if (input.attributes) {
        for (const [key, value] of Object.entries(input.attributes)) {
          userAttributes.push({
            Name: key.startsWith("custom:") ? key : `custom:${key}`,
            Value: value,
          });
        }
      }

      const command = new SignUpCommand({
        ClientId: this.authConfig.clientId,
        Username: input.username,
        Password: input.password,
        UserAttributes: userAttributes,
      });

      const response = await this.client.send(command);

      this.logger.log(`User registered: ${input.username}`);
      return response.UserSub || "unknown";
    } catch (error) {
      this.logger.error(`Error registering user: ${(error as Error).message}`);
      throw new AuthError(
        `Failed to register user ${input.username}`,
        "REGISTER_ERROR",
        error as Error,
      );
    }
  }

  async authenticateUser(
    email: string,
    password: string,
  ): Promise<IAuthResult> {
    try {
      const command = new InitiateAuthCommand({
        ClientId: this.authConfig.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);

      this.logger.log(`User authenticated: ${email}`);
      return {
        accessToken: response.AuthenticationResult?.AccessToken || "",
        idToken: response.AuthenticationResult?.IdToken || "",
        refreshToken: response.AuthenticationResult?.RefreshToken || "",
        expiresIn: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      this.logger.error(
        `Error authenticating user: ${(error as Error).message}`,
      );
      throw new AuthError(
        `Failed to authenticate user ${email}`,
        "AUTH_ERROR",
        error as Error,
      );
    }
  }

  async confirmUser(username: string): Promise<void> {
    try {
      const command = new AdminConfirmSignUpCommand({
        UserPoolId: this.authConfig.userPoolId,
        Username: username,
      });

      await this.client.send(command);
      this.logger.log(`User confirmed: ${username}`);
    } catch (error) {
      this.logger.error(`Error confirming user: ${(error as Error).message}`);
      throw new AuthError(
        `Failed to confirm user ${username}`,
        "CONFIRM_ERROR",
        error as Error,
      );
    }
  }

  async deleteUser(username: string): Promise<boolean> {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.authConfig.userPoolId,
        Username: username,
      });

      await this.client.send(command);
      this.logger.log(`User deleted: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting user: ${(error as Error).message}`);
      throw new AuthError(
        `Failed to delete user ${username}`,
        "DELETE_ERROR",
        error as Error,
      );
    }
  }

  async addToGroup(username: string, group: string): Promise<void> {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: this.authConfig.userPoolId,
        Username: username,
        GroupName: group,
      });

      await this.client.send(command);
      this.logger.log(`User ${username} added to group ${group}`);
    } catch (error) {
      this.logger.error(
        `Error adding user to group: ${(error as Error).message}`,
      );
      throw new AuthError(
        `Failed to add user ${username} to group ${group}`,
        "ADD_GROUP_ERROR",
        error as Error,
      );
    }
  }

  async removeFromGroup(username: string, group: string): Promise<void> {
    try {
      const command = new AdminRemoveUserFromGroupCommand({
        UserPoolId: this.authConfig.userPoolId,
        Username: username,
        GroupName: group,
      });

      await this.client.send(command);
      this.logger.log(`User ${username} removed from group ${group}`);
    } catch (error) {
      this.logger.error(
        `Error removing user from group: ${(error as Error).message}`,
      );
      throw new AuthError(
        `Failed to remove user ${username} from group ${group}`,
        "REMOVE_GROUP_ERROR",
        error as Error,
      );
    }
  }

  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: currentPassword,
        ProposedPassword: newPassword,
      });

      await this.client.send(command);
      this.logger.log("Password changed successfully");
      return true;
    } catch (error) {
      this.logger.error(`Error changing password: ${(error as Error).message}`);
      throw new AuthError(
        "Failed to change password",
        "CHANGE_PASSWORD_ERROR",
        error as Error,
      );
    }
  }

  async forgotPassword(username: string): Promise<boolean> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.authConfig.clientId,
        Username: username,
      });

      await this.client.send(command);
      this.logger.log(`Forgot password initiated for: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error initiating forgot password: ${(error as Error).message}`,
      );
      throw new AuthError(
        `Failed to initiate forgot password for ${username}`,
        "FORGOT_PASSWORD_ERROR",
        error as Error,
      );
    }
  }

  async confirmForgotPassword(
    username: string,
    password: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.authConfig.clientId,
        Username: username,
        Password: password,
        ConfirmationCode: confirmationCode,
      });

      await this.client.send(command);
      this.logger.log(`Password reset confirmed for: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error confirming forgot password: ${(error as Error).message}`,
      );
      throw new AuthError(
        `Failed to confirm forgot password for ${username}`,
        "CONFIRM_FORGOT_PASSWORD_ERROR",
        error as Error,
      );
    }
  }
}
