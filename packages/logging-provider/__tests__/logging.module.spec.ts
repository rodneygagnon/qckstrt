import { Test, TestingModule } from "@nestjs/testing";

import { StructuredLogger } from "../src/logger";
import { LOGGER, LOGGING_CONFIG, LoggingModule } from "../src/logging.module";
import { LoggingConfig, LogLevel } from "../src/types";

describe("LoggingModule", () => {
  describe("forRoot", () => {
    it("should provide logger with static config", async () => {
      const config: LoggingConfig = {
        serviceName: "test-service",
        level: LogLevel.DEBUG,
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const logger = module.get<StructuredLogger>(LOGGER);
      const providedConfig = module.get<LoggingConfig>(LOGGING_CONFIG);

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(providedConfig).toEqual(config);
    });

    it("should export StructuredLogger", async () => {
      const config: LoggingConfig = {
        serviceName: "test-service",
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [LoggingModule.forRoot(config)],
      }).compile();

      const logger = module.get<StructuredLogger>(StructuredLogger);
      expect(logger).toBeInstanceOf(StructuredLogger);
    });
  });

  describe("forRootAsync", () => {
    it("should provide logger with async factory", async () => {
      const config: LoggingConfig = {
        serviceName: "async-test-service",
        level: LogLevel.WARN,
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          LoggingModule.forRootAsync({
            useFactory: () => config,
          }),
        ],
      }).compile();

      const logger = module.get<StructuredLogger>(LOGGER);
      const providedConfig = module.get<LoggingConfig>(LOGGING_CONFIG);

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(providedConfig).toEqual(config);
    });

    it("should support async factory returning promise", async () => {
      const config: LoggingConfig = {
        serviceName: "promise-test-service",
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          LoggingModule.forRootAsync({
            useFactory: async () => config,
          }),
        ],
      }).compile();

      const logger = module.get<StructuredLogger>(LOGGER);
      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it("should support dependency injection in factory", async () => {
      const CONFIG_TOKEN = "CONFIG_TOKEN";
      const mockConfigValue = { serviceName: "injected-service" };

      // Create a module that exports the config token
      const ConfigModule = {
        module: class ConfigModule {},
        providers: [
          {
            provide: CONFIG_TOKEN,
            useValue: mockConfigValue,
          },
        ],
        exports: [CONFIG_TOKEN],
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule,
          LoggingModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: unknown) => ({
              serviceName: (config as { serviceName: string }).serviceName,
            }),
            inject: [CONFIG_TOKEN],
          }),
        ],
      }).compile();

      const providedConfig = module.get<LoggingConfig>(LOGGING_CONFIG);
      expect(providedConfig.serviceName).toBe("injected-service");
    });
  });
});
