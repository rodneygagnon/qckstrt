import "reflect-metadata";
import {
  PostgresProvider,
  PostgresConfig,
} from "../src/providers/postgres.provider";
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

describe("PostgresProvider", () => {
  let provider: PostgresProvider;
  const config: PostgresConfig = {
    host: "localhost",
    port: 5432,
    database: "testdb",
    username: "testuser",
    password: "testpass",
    ssl: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new PostgresProvider(config);
  });

  describe("constructor", () => {
    it("should initialize with config", () => {
      expect(provider.getName()).toBe("PostgreSQL");
      expect(provider.getType()).toBe(RelationalDBType.PostgreSQL);
    });
  });

  describe("getName", () => {
    it("should return PostgreSQL", () => {
      expect(provider.getName()).toBe("PostgreSQL");
    });
  });

  describe("getType", () => {
    it("should return PostgreSQL type", () => {
      expect(provider.getType()).toBe(RelationalDBType.PostgreSQL);
    });
  });

  describe("getConnectionOptions", () => {
    it("should return correct connection options", () => {
      const entities = ["Entity1", "Entity2"];
      const options = provider.getConnectionOptions(entities) as any;

      expect(options.type).toBe("postgres");
      expect(options.host).toBe("localhost");
      expect(options.port).toBe(5432);
      expect(options.database).toBe("testdb");
      expect(options.username).toBe("testuser");
      expect(options.password).toBe("testpass");
      expect(options.entities).toEqual(entities);
      expect(options.synchronize).toBe(true);
      expect(options.logging).toBe(false);
    });

    it("should configure SSL when enabled", () => {
      const sslConfig: PostgresConfig = { ...config, ssl: true };
      const sslProvider = new PostgresProvider(sslConfig);
      const options = sslProvider.getConnectionOptions([]) as any;

      expect(options.ssl).toEqual({ rejectUnauthorized: false });
    });

    it("should disable SSL when not configured", () => {
      const options = provider.getConnectionOptions([]) as any;

      expect(options.ssl).toBe(false);
    });
  });

  describe("isAvailable", () => {
    it("should return true", async () => {
      const result = await provider.isAvailable();
      expect(result).toBe(true);
    });
  });
});
