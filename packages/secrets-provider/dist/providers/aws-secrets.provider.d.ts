import { ConfigService } from "@nestjs/config";
import { ISecretsProvider } from "@qckstrt/common";
/**
 * AWS Secrets Manager Provider
 *
 * Implements secrets retrieval using AWS Secrets Manager.
 */
export declare class AWSSecretsProvider implements ISecretsProvider {
  private configService;
  private readonly logger;
  private readonly client;
  private readonly config;
  constructor(configService: ConfigService);
  getName(): string;
  getSecret(secretId: string): Promise<string | undefined>;
  getSecrets(secretIds: string[]): Promise<Record<string, string | undefined>>;
  getSecretJson<T>(secretId: string): Promise<T | undefined>;
}
//# sourceMappingURL=aws-secrets.provider.d.ts.map
