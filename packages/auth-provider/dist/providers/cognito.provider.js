"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var CognitoAuthProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoAuthProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const common_2 = require("@qckstrt/common");
/**
 * AWS Cognito Auth Provider
 *
 * Implements authentication operations using AWS Cognito.
 */
let CognitoAuthProvider = (CognitoAuthProvider_1 = class CognitoAuthProvider {
  configService;
  logger = new common_1.Logger(CognitoAuthProvider_1.name, {
    timestamp: true,
  });
  client;
  authConfig;
  constructor(configService) {
    this.configService = configService;
    const region = configService.get("region") || "us-east-1";
    const userPoolId = configService.get("auth.userPoolId");
    const clientId = configService.get("auth.clientId");
    if (!userPoolId || !clientId) {
      throw new common_2.AuthError(
        "Auth configuration is missing userPoolId or clientId",
        "CONFIG_ERROR",
      );
    }
    this.authConfig = {
      region,
      userPoolId,
      clientId,
      clientSecret: configService.get("auth.clientSecret"),
    };
    this.client =
      new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
        region,
      });
    this.logger.log(`CognitoAuthProvider initialized for region: ${region}`);
  }
  getName() {
    return "CognitoAuthProvider";
  }
  async registerUser(input) {
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
      const command = new client_cognito_identity_provider_1.SignUpCommand({
        ClientId: this.authConfig.clientId,
        Username: input.username,
        Password: input.password,
        UserAttributes: userAttributes,
      });
      const response = await this.client.send(command);
      this.logger.log(`User registered: ${input.username}`);
      return response.UserSub || "unknown";
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to register user ${input.username}`,
        "REGISTER_ERROR",
        error,
      );
    }
  }
  async authenticateUser(email, password) {
    try {
      const command =
        new client_cognito_identity_provider_1.InitiateAuthCommand({
          ClientId: this.authConfig.clientId,
          AuthFlow:
            client_cognito_identity_provider_1.AuthFlowType.USER_PASSWORD_AUTH,
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
      this.logger.error(`Error authenticating user: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to authenticate user ${email}`,
        "AUTH_ERROR",
        error,
      );
    }
  }
  async confirmUser(username) {
    try {
      const command =
        new client_cognito_identity_provider_1.AdminConfirmSignUpCommand({
          UserPoolId: this.authConfig.userPoolId,
          Username: username,
        });
      await this.client.send(command);
      this.logger.log(`User confirmed: ${username}`);
    } catch (error) {
      this.logger.error(`Error confirming user: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to confirm user ${username}`,
        "CONFIRM_ERROR",
        error,
      );
    }
  }
  async deleteUser(username) {
    try {
      const command =
        new client_cognito_identity_provider_1.AdminDeleteUserCommand({
          UserPoolId: this.authConfig.userPoolId,
          Username: username,
        });
      await this.client.send(command);
      this.logger.log(`User deleted: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to delete user ${username}`,
        "DELETE_ERROR",
        error,
      );
    }
  }
  async addToGroup(username, group) {
    try {
      const command =
        new client_cognito_identity_provider_1.AdminAddUserToGroupCommand({
          UserPoolId: this.authConfig.userPoolId,
          Username: username,
          GroupName: group,
        });
      await this.client.send(command);
      this.logger.log(`User ${username} added to group ${group}`);
    } catch (error) {
      this.logger.error(`Error adding user to group: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to add user ${username} to group ${group}`,
        "ADD_GROUP_ERROR",
        error,
      );
    }
  }
  async removeFromGroup(username, group) {
    try {
      const command =
        new client_cognito_identity_provider_1.AdminRemoveUserFromGroupCommand({
          UserPoolId: this.authConfig.userPoolId,
          Username: username,
          GroupName: group,
        });
      await this.client.send(command);
      this.logger.log(`User ${username} removed from group ${group}`);
    } catch (error) {
      this.logger.error(`Error removing user from group: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to remove user ${username} from group ${group}`,
        "REMOVE_GROUP_ERROR",
        error,
      );
    }
  }
  async changePassword(accessToken, currentPassword, newPassword) {
    try {
      const command =
        new client_cognito_identity_provider_1.ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword,
        });
      await this.client.send(command);
      this.logger.log("Password changed successfully");
      return true;
    } catch (error) {
      this.logger.error(`Error changing password: ${error.message}`);
      throw new common_2.AuthError(
        "Failed to change password",
        "CHANGE_PASSWORD_ERROR",
        error,
      );
    }
  }
  async forgotPassword(username) {
    try {
      const command =
        new client_cognito_identity_provider_1.ForgotPasswordCommand({
          ClientId: this.authConfig.clientId,
          Username: username,
        });
      await this.client.send(command);
      this.logger.log(`Forgot password initiated for: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(`Error initiating forgot password: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to initiate forgot password for ${username}`,
        "FORGOT_PASSWORD_ERROR",
        error,
      );
    }
  }
  async confirmForgotPassword(username, password, confirmationCode) {
    try {
      const command =
        new client_cognito_identity_provider_1.ConfirmForgotPasswordCommand({
          ClientId: this.authConfig.clientId,
          Username: username,
          Password: password,
          ConfirmationCode: confirmationCode,
        });
      await this.client.send(command);
      this.logger.log(`Password reset confirmed for: ${username}`);
      return true;
    } catch (error) {
      this.logger.error(`Error confirming forgot password: ${error.message}`);
      throw new common_2.AuthError(
        `Failed to confirm forgot password for ${username}`,
        "CONFIRM_FORGOT_PASSWORD_ERROR",
        error,
      );
    }
  }
});
exports.CognitoAuthProvider = CognitoAuthProvider;
exports.CognitoAuthProvider =
  CognitoAuthProvider =
  CognitoAuthProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      CognitoAuthProvider,
    );
//# sourceMappingURL=cognito.provider.js.map
