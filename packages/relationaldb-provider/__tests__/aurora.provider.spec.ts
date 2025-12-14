import "reflect-metadata";
import { AuroraProvider, AuroraConfig } from "../src/providers/aurora.provider";
import { RelationalDBType } from "@qckstrt/common";

// Mock NestJS Logger
jest.mock("@nestjs/common", () => ({
  Injectable: () => (target: any) => target,
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

describe("AuroraProvider", () => {
  let provider: AuroraProvider;
  const config: AuroraConfig = {
    database: "testdb",
    secretArn: "arn:aws:secretsmanager:us-east-1:123456789:secret:test",
    resourceArn: "arn:aws:rds:us-east-1:123456789:cluster:test-cluster",
    region: "us-east-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new AuroraProvider(config);
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider.getName()).toBe("Aurora PostgreSQL");
      expect(provider.getType()).toBe(RelationalDBType.AuroraPostgreSQL);
    });
  });

  describe("getName", () => {
    it("should return Aurora PostgreSQL", () => {
      expect(provider.getName()).toBe("Aurora PostgreSQL");
    });
  });

  describe("getType", () => {
    it("should return AuroraPostgreSQL type", () => {
      expect(provider.getType()).toBe(RelationalDBType.AuroraPostgreSQL);
    });
  });

  describe("getConnectionOptions", () => {
    it("should return correct connection options", () => {
      const entities = ["Entity1", "Entity2"];
      const options = provider.getConnectionOptions(entities);

      expect(options.type).toBe("aurora-postgres");
      expect(options.database).toBe("testdb");
      expect((options as any).secretArn).toBe(config.secretArn);
      expect((options as any).resourceArn).toBe(config.resourceArn);
      expect((options as any).region).toBe("us-east-1");
      expect(options.entities).toEqual(entities);
      expect(options.synchronize).toBe(true);
      expect(options.logging).toBe(false);
      expect((options as any).keepConnectionAlive).toBe(true);
      expect((options as any).formatOptions).toEqual({ enableUuidHack: true });
    });
  });

  describe("isAvailable", () => {
    it("should return true", async () => {
      const result = await provider.isAvailable();
      expect(result).toBe(true);
    });
  });
});
