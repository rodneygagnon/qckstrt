import {
  DynamicModule,
  Global,
  InjectionToken,
  Module,
  OptionalFactoryDependency,
  Provider,
} from "@nestjs/common";

import { createLogger, StructuredLogger } from "./logger";
import { LoggingConfig } from "./types";

/**
 * Token for injecting the logger
 */
export const LOGGER = Symbol("LOGGER");

/**
 * Token for injecting the logging configuration
 */
export const LOGGING_CONFIG = Symbol("LOGGING_CONFIG");

/**
 * Options for async module configuration
 */
export interface LoggingModuleAsyncOptions {
  useFactory: (...args: unknown[]) => Promise<LoggingConfig> | LoggingConfig;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  imports?: DynamicModule["imports"];
}

/**
 * NestJS module for structured logging
 *
 * @example
 * // Synchronous configuration
 * LoggingModule.forRoot({
 *   serviceName: 'my-service',
 *   level: LogLevel.DEBUG,
 *   format: 'pretty',
 * })
 *
 * @example
 * // Async configuration from ConfigService
 * LoggingModule.forRootAsync({
 *   imports: [ConfigModule],
 *   useFactory: (config: ConfigService) => ({
 *     serviceName: config.get('SERVICE_NAME'),
 *     level: config.get('LOG_LEVEL'),
 *   }),
 *   inject: [ConfigService],
 * })
 */
@Global()
@Module({})
export class LoggingModule {
  /**
   * Configure the logging module with static options
   */
  static forRoot(config: LoggingConfig): DynamicModule {
    const logger = createLogger(config);

    const providers: Provider[] = [
      {
        provide: LOGGING_CONFIG,
        useValue: config,
      },
      {
        provide: LOGGER,
        useValue: logger,
      },
      {
        provide: StructuredLogger,
        useValue: logger,
      },
    ];

    return {
      module: LoggingModule,
      providers,
      exports: [LOGGER, StructuredLogger, LOGGING_CONFIG],
    };
  }

  /**
   * Configure the logging module with async options
   */
  static forRootAsync(options: LoggingModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: LOGGING_CONFIG,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
      {
        provide: LOGGER,
        useFactory: (config: LoggingConfig) => createLogger(config),
        inject: [LOGGING_CONFIG],
      },
      {
        provide: StructuredLogger,
        useFactory: (config: LoggingConfig) => createLogger(config),
        inject: [LOGGING_CONFIG],
      },
    ];

    return {
      module: LoggingModule,
      imports: options.imports as DynamicModule["imports"],
      providers,
      exports: [LOGGER, StructuredLogger, LOGGING_CONFIG],
    };
  }
}
