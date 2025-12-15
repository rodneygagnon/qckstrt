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
var SupabaseAuthProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuthProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const common_2 = require("@qckstrt/common");
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
let SupabaseAuthProvider =
  (SupabaseAuthProvider_1 = class SupabaseAuthProvider {
    configService;
    logger = new common_1.Logger(SupabaseAuthProvider_1.name, {
      timestamp: true,
    });
    supabase;
    config;
    constructor(configService) {
      this.configService = configService;
      const url = configService.get("supabase.url");
      const anonKey = configService.get("supabase.anonKey");
      const serviceRoleKey = configService.get("supabase.serviceRoleKey");
      if (!url || !anonKey) {
        throw new common_2.AuthError(
          "Supabase configuration is missing url or anonKey",
          "CONFIG_ERROR",
        );
      }
      this.config = {
        url,
        anonKey,
        serviceRoleKey,
      };
      // Use service role key for admin operations if available
      this.supabase = (0, supabase_js_1.createClient)(
        url,
        serviceRoleKey || anonKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );
      this.logger.log(`SupabaseAuthProvider initialized for: ${url}`);
    }
    getName() {
      return "SupabaseAuthProvider";
    }
    async registerUser(input) {
      try {
        // Build user metadata including username and custom attributes
        const userMetadata = {
          username: input.username,
        };
        if (input.attributes) {
          for (const [key, value] of Object.entries(input.attributes)) {
            // Remove "custom:" prefix if present (Supabase doesn't use it)
            const cleanKey = key.startsWith("custom:") ? key.slice(7) : key;
            userMetadata[cleanKey] = value;
          }
        }
        const { data, error } = await this.supabase.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: false,
          user_metadata: userMetadata,
        });
        if (error) {
          throw error;
        }
        this.logger.log(`User registered: ${input.username}`);
        return data.user?.id || "unknown";
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
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        this.logger.log(`User authenticated: ${email}`);
        return {
          accessToken: data.session?.access_token || "",
          // Supabase uses the access token for both purposes
          idToken: data.session?.access_token || "",
          refreshToken: data.session?.refresh_token || "",
          expiresIn: data.session?.expires_in,
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
        // First, find the user by username (stored in user_metadata)
        const userId = await this.getUserIdByUsername(username);
        if (!userId) {
          throw new Error(`User not found: ${username}`);
        }
        // Confirm the user by setting email_confirmed_at
        const { error } = await this.supabase.auth.admin.updateUserById(
          userId,
          {
            email_confirm: true,
          },
        );
        if (error) {
          throw error;
        }
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
        const userId = await this.getUserIdByUsername(username);
        if (!userId) {
          throw new Error(`User not found: ${username}`);
        }
        const { error } = await this.supabase.auth.admin.deleteUser(userId);
        if (error) {
          throw error;
        }
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
        const userId = await this.getUserIdByUsername(username);
        if (!userId) {
          throw new Error(`User not found: ${username}`);
        }
        // Get current user to retrieve existing roles
        const { data: userData, error: getUserError } =
          await this.supabase.auth.admin.getUserById(userId);
        if (getUserError) {
          throw getUserError;
        }
        // Get existing roles or initialize empty array
        const currentRoles = userData.user?.app_metadata?.roles || [];
        // Add new group if not already present
        if (!currentRoles.includes(group)) {
          const { error } = await this.supabase.auth.admin.updateUserById(
            userId,
            {
              app_metadata: {
                ...userData.user?.app_metadata,
                roles: [...currentRoles, group],
              },
            },
          );
          if (error) {
            throw error;
          }
        }
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
        const userId = await this.getUserIdByUsername(username);
        if (!userId) {
          throw new Error(`User not found: ${username}`);
        }
        // Get current user to retrieve existing roles
        const { data: userData, error: getUserError } =
          await this.supabase.auth.admin.getUserById(userId);
        if (getUserError) {
          throw getUserError;
        }
        // Get existing roles
        const currentRoles = userData.user?.app_metadata?.roles || [];
        // Remove the group
        const newRoles = currentRoles.filter((r) => r !== group);
        const { error } = await this.supabase.auth.admin.updateUserById(
          userId,
          {
            app_metadata: {
              ...userData.user?.app_metadata,
              roles: newRoles,
            },
          },
        );
        if (error) {
          throw error;
        }
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
    async changePassword(accessToken, _currentPassword, newPassword) {
      try {
        // Create a client with the user's access token
        const userClient = (0, supabase_js_1.createClient)(
          this.config.url,
          this.config.anonKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          },
        );
        const { error } = await userClient.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          throw error;
        }
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
        // In Supabase, forgotPassword uses email, so we need to find the email
        // If username is already an email, use it directly
        const email = username.includes("@")
          ? username
          : await this.getEmailByUsername(username);
        if (!email) {
          throw new Error(`User not found: ${username}`);
        }
        const { error } = await this.supabase.auth.resetPasswordForEmail(email);
        if (error) {
          throw error;
        }
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
        // Get email for the username
        const email = username.includes("@")
          ? username
          : await this.getEmailByUsername(username);
        if (!email) {
          throw new Error(`User not found: ${username}`);
        }
        // Verify the OTP token
        const { data, error: verifyError } = await this.supabase.auth.verifyOtp(
          {
            email,
            token: confirmationCode,
            type: "recovery",
          },
        );
        if (verifyError) {
          throw verifyError;
        }
        // Update the password using the session from OTP verification
        if (data.session) {
          const userClient = (0, supabase_js_1.createClient)(
            this.config.url,
            this.config.anonKey,
            {
              global: {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`,
                },
              },
            },
          );
          const { error: updateError } = await userClient.auth.updateUser({
            password,
          });
          if (updateError) {
            throw updateError;
          }
        }
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
    /**
     * Helper method to find a user's ID by their username
     * Username is stored in user_metadata
     */
    async getUserIdByUsername(username) {
      try {
        // List users and find by username in metadata
        // Note: This is not ideal for large user bases - consider using a lookup table
        const { data, error } = await this.supabase.auth.admin.listUsers();
        if (error) {
          throw error;
        }
        const user = data.users.find(
          (u) => u.user_metadata?.username === username || u.email === username,
        );
        return user?.id || null;
      } catch (error) {
        this.logger.error(`Error finding user by username: ${error.message}`);
        return null;
      }
    }
    /**
     * Helper method to find a user's email by their username
     */
    async getEmailByUsername(username) {
      try {
        const { data, error } = await this.supabase.auth.admin.listUsers();
        if (error) {
          throw error;
        }
        const user = data.users.find(
          (u) => u.user_metadata?.username === username,
        );
        return user?.email || null;
      } catch (error) {
        this.logger.error(`Error finding email by username: ${error.message}`);
        return null;
      }
    }
  });
exports.SupabaseAuthProvider = SupabaseAuthProvider;
exports.SupabaseAuthProvider =
  SupabaseAuthProvider =
  SupabaseAuthProvider_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      SupabaseAuthProvider,
    );
//# sourceMappingURL=supabase.provider.js.map
