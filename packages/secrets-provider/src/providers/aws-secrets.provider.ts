import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  ISecretsProvider,
  ISecretsConfig,
  SecretsError,
} from "@qckstrt/common";

/**
 * Helper function to get a secret without dependency injection.
 * Useful for bootstrap/config scenarios before DI is available.
 */
export async function getSecrets(
  secretId: string,
  region?: string,
): Promise<string> {
  const client = new SecretsManagerClient({
    region: region || process.env.AWS_REGION || "us-east-1",
  });

  const command = new GetSecretValueCommand({
    SecretId: secretId,
  });

  const response = await client.send(command);
  return response.SecretString || "";
}

/**
 * AWS Secrets Manager Provider
 *
 * Implements secrets retrieval using AWS Secrets Manager.
 */
@Injectable()
export class AWSSecretsProvider implements ISecretsProvider {
  private readonly logger = new Logger(AWSSecretsProvider.name, {
    timestamp: true,
  });
  private readonly client: SecretsManagerClient;
  private readonly config: ISecretsConfig;

  constructor(private configService: ConfigService) {
    const region = configService.get<string>("region") || "us-east-1";

    this.config = { region };
    this.client = new SecretsManagerClient({ region });

    this.logger.log(`AWSSecretsProvider initialized for region: ${region}`);
  }

  getName(): string {
    return "AWSSecretsProvider";
  }

  async getSecret(secretId: string): Promise<string | undefined> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: secretId,
      });

      const response = await this.client.send(command);

      this.logger.log(`Retrieved secret: ${secretId}`);
      return response.SecretString;
    } catch (error) {
      if ((error as { name?: string }).name === "ResourceNotFoundException") {
        this.logger.warn(`Secret not found: ${secretId}`);
        return undefined;
      }

      this.logger.error(`Error retrieving secret: ${(error as Error).message}`);
      throw new SecretsError(
        `Failed to retrieve secret ${secretId}`,
        "GET_SECRET_ERROR",
        error as Error,
      );
    }
  }

  async getSecrets(
    secretIds: string[],
  ): Promise<Record<string, string | undefined>> {
    const results: Record<string, string | undefined> = {};

    // Fetch secrets in parallel
    const promises = secretIds.map(async (secretId) => {
      try {
        results[secretId] = await this.getSecret(secretId);
      } catch (error) {
        this.logger.error(
          `Error retrieving secret ${secretId}: ${(error as Error).message}`,
        );
        results[secretId] = undefined;
      }
    });

    await Promise.all(promises);

    return results;
  }

  async getSecretJson<T>(secretId: string): Promise<T | undefined> {
    const secret = await this.getSecret(secretId);

    if (!secret) {
      return undefined;
    }

    try {
      return JSON.parse(secret) as T;
    } catch (error) {
      this.logger.error(
        `Error parsing secret JSON: ${(error as Error).message}`,
      );
      throw new SecretsError(
        `Failed to parse secret ${secretId} as JSON`,
        "PARSE_SECRET_ERROR",
        error as Error,
      );
    }
  }
}
