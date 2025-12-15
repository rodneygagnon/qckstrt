import { ConfigService } from "@nestjs/config";
import {
  IAuthProvider,
  IAuthResult,
  IRegisterUserInput,
} from "@qckstrt/common";
/**
 * Supabase Auth Provider
 *
 * Implements authentication operations using Supabase Auth (GoTrue).
 * This is an OSS alternative to AWS Cognito.
 *
 * Requires:
 * - SUPABASE_URL: The Supabase project URL
 * - SUPABASE_ANON_KEY: The anonymous key for client operations
 * - SUPABASE_SERVICE_ROLE_KEY: The service role key for admin operations (optional but recommended)
 */
export declare class SupabaseAuthProvider implements IAuthProvider {
  private configService;
  private readonly logger;
  private readonly supabase;
  private readonly config;
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
    _currentPassword: string,
    newPassword: string,
  ): Promise<boolean>;
  forgotPassword(username: string): Promise<boolean>;
  confirmForgotPassword(
    username: string,
    password: string,
    confirmationCode: string,
  ): Promise<boolean>;
  /**
   * Helper method to find a user's ID by their username
   * Username is stored in user_metadata
   */
  private getUserIdByUsername;
  /**
   * Helper method to find a user's email by their username
   */
  private getEmailByUsername;
}
//# sourceMappingURL=supabase.provider.d.ts.map
