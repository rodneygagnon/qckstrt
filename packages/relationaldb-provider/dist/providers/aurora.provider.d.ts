import { DataSourceOptions } from "typeorm";
import { IRelationalDBProvider, RelationalDBType } from "@qckstrt/common";
/**
 * Aurora PostgreSQL configuration
 */
export interface AuroraConfig {
  database: string;
  secretArn: string;
  resourceArn: string;
  region: string;
}
/**
 * Aurora PostgreSQL Provider (AWS)
 *
 * AWS Aurora Serverless with Data API for serverless deployments.
 *
 * Setup:
 * 1. Create Aurora Serverless cluster in AWS
 * 2. Enable Data API
 * 3. Store credentials in AWS Secrets Manager
 * 4. Configure ARNs in config
 *
 * Pros:
 * - Serverless (auto-scaling)
 * - No connection management
 * - AWS-native integration
 * - Cost-effective for variable workloads
 *
 * Cons:
 * - AWS-specific (vendor lock-in)
 * - Data API has some limitations
 * - Cold start latency possible
 */
export declare class AuroraProvider implements IRelationalDBProvider {
  private readonly config;
  private readonly logger;
  constructor(config: AuroraConfig);
  getName(): string;
  getType(): RelationalDBType;
  getConnectionOptions(
    entities: DataSourceOptions["entities"],
  ): DataSourceOptions;
  isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=aurora.provider.d.ts.map
