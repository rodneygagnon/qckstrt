import { LoggerService } from "@nestjs/common";

import {
  ILogger,
  LogEntry,
  LoggingConfig,
  LoggingError,
  LogLevel,
} from "./types";

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Structured logger implementation that outputs JSON for CloudWatch Logs
 * or pretty-printed logs for development.
 */
export class StructuredLogger implements ILogger, LoggerService {
  private readonly config: Required<LoggingConfig>;
  private requestId?: string;
  private userId?: string;
  private context?: string;

  constructor(config: LoggingConfig) {
    if (!config.serviceName) {
      throw new LoggingError("serviceName is required");
    }

    this.config = {
      serviceName: config.serviceName,
      level: config.level ?? LogLevel.INFO,
      format:
        config.format ??
        (process.env.NODE_ENV === "production" ? "json" : "pretty"),
      timestamp: config.timestamp ?? true,
      stackTrace: config.stackTrace ?? process.env.NODE_ENV !== "production",
    };
  }

  /**
   * Set the request ID for tracing
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Set the user ID for authenticated requests
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): ILogger {
    const childLogger = new StructuredLogger(this.config);
    childLogger.context = context;
    childLogger.requestId = this.requestId;
    childLogger.userId = this.userId;
    return childLogger;
  }

  /**
   * Log at DEBUG level
   */
  debug(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.DEBUG, message, context, meta);
  }

  /**
   * Log at INFO level (alias for log)
   */
  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.writeLog(LogLevel.INFO, message, context, meta);
  }

  /**
   * Log at INFO level
   */
  info(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.INFO, message, context, meta);
  }

  /**
   * Log at WARN level
   */
  warn(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.WARN, message, context, meta);
  }

  /**
   * Log at ERROR level
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    const errorMeta = trace
      ? {
          ...meta,
          error: {
            name: "Error",
            message,
            stack: this.config.stackTrace ? trace : undefined,
          },
        }
      : meta;
    this.writeLog(LogLevel.ERROR, message, context, errorMeta);
  }

  /**
   * NestJS LoggerService interface method
   */
  verbose(message: string, context?: string): void {
    this.debug(message, context);
  }

  /**
   * NestJS LoggerService interface method
   */
  fatal(message: string, context?: string): void {
    this.error(message, undefined, context);
  }

  /**
   * Check if the log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.level];
  }

  /**
   * Write a log entry
   */
  private writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, meta);

    if (this.config.format === "json") {
      this.writeJson(entry, level);
    } else {
      this.writePretty(entry, level);
    }
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.config.serviceName,
      message,
    };

    const effectiveContext = context ?? this.context;
    if (effectiveContext) {
      entry.context = effectiveContext;
    }

    if (this.requestId) {
      entry.requestId = this.requestId;
    }

    if (this.userId) {
      entry.userId = this.userId;
    }

    if (meta) {
      if ("error" in meta && typeof meta.error === "object") {
        entry.error = meta.error as LogEntry["error"];
        const { error: _error, ...restMeta } = meta;
        if (Object.keys(restMeta).length > 0) {
          entry.meta = restMeta;
        }
      } else if (Object.keys(meta).length > 0) {
        entry.meta = meta;
      }
    }

    return entry;
  }

  /**
   * Write JSON formatted log (for CloudWatch)
   */
  private writeJson(entry: LogEntry, level: LogLevel): void {
    const output = JSON.stringify(entry);

    if (level === LogLevel.ERROR) {
      console.error(output);
    } else if (level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  /**
   * Write pretty-printed log (for development)
   */
  private writePretty(entry: LogEntry, level: LogLevel): void {
    const colors = {
      [LogLevel.DEBUG]: "\x1b[36m", // Cyan
      [LogLevel.INFO]: "\x1b[32m", // Green
      [LogLevel.WARN]: "\x1b[33m", // Yellow
      [LogLevel.ERROR]: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";
    const dim = "\x1b[2m";

    const timestamp = this.config.timestamp
      ? `${dim}${entry.timestamp}${reset} `
      : "";
    const levelStr = `${colors[level]}[${level.toUpperCase()}]${reset}`;
    const contextStr = entry.context ? ` ${dim}[${entry.context}]${reset}` : "";
    const requestStr = entry.requestId
      ? ` ${dim}(${entry.requestId})${reset}`
      : "";

    let output = `${timestamp}${levelStr}${contextStr}${requestStr} ${entry.message}`;

    if (entry.meta && Object.keys(entry.meta).length > 0) {
      output += ` ${dim}${JSON.stringify(entry.meta)}${reset}`;
    }

    if (entry.error?.stack) {
      output += `\n${dim}${entry.error.stack}${reset}`;
    }

    if (level === LogLevel.ERROR) {
      console.error(output);
    } else if (level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

/**
 * Create a logger instance with the given configuration
 */
export function createLogger(config: LoggingConfig): StructuredLogger {
  return new StructuredLogger(config);
}
