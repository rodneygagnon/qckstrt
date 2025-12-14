/**
 * Secrets Provider Types
 *
 * Interfaces for secrets management operations (AWS Secrets Manager, etc.)
 */
/**
 * Secrets provider configuration
 */
export interface ISecretsConfig {
  region: string;
}
/**
 * Secrets provider interface
 */
export interface ISecretsProvider {
  /**
   * Get provider name
   */
  getName(): string;
  /**
   * Get a secret value by ID
   */
  getSecret(secretId: string): Promise<string | undefined>;
  /**
   * Get multiple secrets by IDs
   */
  getSecrets?(secretIds: string[]): Promise<Record<string, string | undefined>>;
  /**
   * Get a secret as JSON object
   */
  getSecretJson?<T>(secretId: string): Promise<T | undefined>;
}
/**
 * Secrets error class
 */
export declare class SecretsError extends Error {
  readonly code: string;
  readonly cause?: Error | undefined;
  constructor(message: string, code: string, cause?: Error | undefined);
}
//# sourceMappingURL=types.d.ts.map
