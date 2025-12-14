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
var AuroraProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuroraProvider = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@qckstrt/common");
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
let AuroraProvider = (AuroraProvider_1 = class AuroraProvider {
  config;
  logger = new common_1.Logger(AuroraProvider_1.name);
  constructor(config) {
    this.config = config;
    this.logger.log(
      `Aurora provider initialized: ${config.database} in ${config.region}`,
    );
  }
  getName() {
    return "Aurora PostgreSQL";
  }
  getType() {
    return common_2.RelationalDBType.AuroraPostgreSQL;
  }
  getConnectionOptions(entities) {
    return {
      type: "aurora-postgres", // TypeORM aurora-data-api driver
      database: this.config.database,
      secretArn: this.config.secretArn,
      resourceArn: this.config.resourceArn,
      region: this.config.region,
      entities,
      synchronize: true,
      logging: false,
      keepConnectionAlive: true,
      serviceConfigOptions: {
        // Additional AWS SDK RDS client options
      },
      formatOptions: {
        // Data API format options
        enableUuidHack: true,
      },
    };
  }
  async isAvailable() {
    try {
      // Aurora availability depends on AWS credentials and network
      return true;
    } catch (error) {
      this.logger.error("Aurora availability check failed:", error);
      return false;
    }
  }
});
exports.AuroraProvider = AuroraProvider;
exports.AuroraProvider =
  AuroraProvider =
  AuroraProvider_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata("design:paramtypes", [Object])],
      AuroraProvider,
    );
//# sourceMappingURL=aurora.provider.js.map
