import "reflect-metadata";
import { SQLiteProvider, SQLiteConfig } from "../src/providers/sqlite.provider";
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

describe("SQLiteProvider", () => {
  describe("with file database", () => {
    let provider: SQLiteProvider;
    const config: SQLiteConfig = {
      database: "./data/test.sqlite",
    };

    beforeEach(() => {
      jest.clearAllMocks();
      provider = new SQLiteProvider(config);
    });

    describe("constructor", () => {
      it("should initialize with file path", () => {
        expect(provider.getName()).toBe("SQLite");
        expect(provider.getType()).toBe(RelationalDBType.SQLite);
      });
    });

    describe("getName", () => {
      it("should return SQLite", () => {
        expect(provider.getName()).toBe("SQLite");
      });
    });

    describe("getType", () => {
      it("should return SQLite type", () => {
        expect(provider.getType()).toBe(RelationalDBType.SQLite);
      });
    });

    describe("getConnectionOptions", () => {
      it("should return correct connection options for file DB", () => {
        const entities = ["Entity1"];
        const options = provider.getConnectionOptions(entities);

        expect(options.type).toBe("sqlite");
        expect(options.database).toBe("./data/test.sqlite");
        expect(options.entities).toEqual(entities);
        expect(options.synchronize).toBe(true);
        expect(options.logging).toBe(false);
        expect((options as any).enableWAL).toBe(true);
      });
    });

    describe("isAvailable", () => {
      it("should always return true", async () => {
        const result = await provider.isAvailable();
        expect(result).toBe(true);
      });
    });
  });

  describe("with in-memory database", () => {
    let provider: SQLiteProvider;
    const config: SQLiteConfig = {
      database: ":memory:",
    };

    beforeEach(() => {
      jest.clearAllMocks();
      provider = new SQLiteProvider(config);
    });

    describe("constructor", () => {
      it("should initialize with in-memory flag", () => {
        expect(provider.getName()).toBe("SQLite");
      });
    });

    describe("getConnectionOptions", () => {
      it("should disable WAL for in-memory DB", () => {
        const options = provider.getConnectionOptions([]);

        expect(options.database).toBe(":memory:");
        expect((options as any).enableWAL).toBe(false);
      });
    });
  });
});
