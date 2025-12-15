import { Inject, Injectable, NestMiddleware, Optional } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ILogger, LOGGER } from '@qckstrt/logging-provider';
import { createLogger, LogLevel } from '@qckstrt/logging-provider';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: ILogger;

  constructor(@Optional() @Inject(LOGGER) logger?: ILogger) {
    // Use injected logger or create a default one
    this.logger =
      logger?.child('LoggerMiddleware') ??
      createLogger({
        serviceName: 'backend',
        level: LogLevel.INFO,
        format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
      });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const requestId =
      (req.headers['x-request-id'] as string) || crypto.randomUUID();
    const userId = req.headers['user'] as string;

    // Set request context
    this.logger.setRequestId(requestId);
    if (userId) {
      this.logger.setUserId(userId);
    }

    // Log incoming request
    this.logger.info('Incoming request', undefined, {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    });

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.info('Request completed', undefined, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  }
}
