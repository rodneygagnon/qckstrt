import { ConfigService } from "@nestjs/config";
import {
  IAuthProvider,
  IAuthResult,
  IRegisterUserInput,
} from "@qckstrt/common";
/**
 * AWS Cognito Auth Provider
 *
 * Implements authentication operations using AWS Cognito.
 */
export declare class CognitoAuthProvider implements IAuthProvider {
  private configService;
  private readonly logger;
  private readonly client;
  private readonly authConfig;
  constructor(configService: ConfigService);
  getName(): string;
  registerUser(input: IRegisterUserInput): Promise<string>;
  authenticateUser(email: string, password: string): Promise<IAuthResult>;
  confirmUser(username: string): Promise<void>;
  deleteUser(username: string): Promise<boolean>;
  addToGroup(username: string, group: string): Promise<void>;
  removeFromGroup(username: string, group: string): Promise<void>;
  changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;
  forgotPassword(username: string): Promise<boolean>;
  confirmForgotPassword(
    username: string,
    password: string,
    confirmationCode: string,
  ): Promise<boolean>;
}
//# sourceMappingURL=cognito.provider.d.ts.map
