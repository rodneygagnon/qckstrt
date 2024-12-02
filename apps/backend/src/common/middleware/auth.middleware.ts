import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request, Response, NextFunction } from 'express';

import passport from 'passport';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly apiKeys: Map<string, string>;
  private readonly logger = new Logger(AuthMiddleware.name, {
    timestamp: true,
  });

  constructor(private readonly configService: ConfigService) {
    this.apiKeys =
      this.configService.get<Map<string, string>>('apiKeys') ||
      new Map<string, string>();
  }

  private async validateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (req.headers.authorization) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      passport.authenticate(
        'jwt',
        { session: false },
        (err: any, user: any, info: any) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            return res.send({
              success: false,
              message: 'Authorization Token is Invalid!',
            });
          }

          req.headers['user'] = JSON.stringify(user);

          return next();
        },
      )(req, res, next);
    } else {
      return next();
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Request: ${JSON.stringify(req.headers)}`);

    return this.validateRequest(req, res, next);
  }
}
