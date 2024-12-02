import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto-js';

@Injectable()
export class HMACMiddleware implements NestMiddleware {
  private readonly apiKeys: Map<string, string>;
  private readonly logger = new Logger(HMACMiddleware.name, {
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
    const hmac = req.headers['proxy-authorization']?.split(' ');

    if (hmac?.length === 2 && hmac[0].toLowerCase() === 'hmac') {
      const credentials = JSON.parse(hmac[1]);

      const headers = credentials.headers?.split(',');
      const signatureString = headers
        ?.map((key: string) => {
          if (key.toLowerCase() === '@request-target') {
            return `${req.method.toLocaleLowerCase()} ${req.path}`;
          } else {
            return `${key.toLowerCase()}: ${req.headers[key]}`;
          }
        })
        .join('\n');

      let signatureHash = '';

      const apiKey = this.apiKeys.get(credentials.username) || '';

      switch (credentials.algorithm) {
        case 'hmac-sha1':
          signatureHash = crypto.enc.Base64.stringify(
            crypto.HmacSHA1(signatureString, apiKey),
          );
          break;
        case 'hmac-sha256':
          signatureHash = crypto.enc.Base64.stringify(
            crypto.HmacSHA256(signatureString, apiKey),
          );
          break;
        case 'hmac-sha512':
          signatureHash = crypto.enc.Base64.stringify(
            crypto.HmacSHA512(signatureString, apiKey),
          );
          break;
      }

      if (signatureHash === credentials.signature) {
        return next();
      }
    }

    throw new UnauthorizedException('Invalid Proxy-Authorization', {
      cause: new Error(),
      description: 'HMAC Proxy-Authorization is Invalid.',
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Request: ${JSON.stringify(req.headers)}`);

    return this.validateRequest(req, res, next);
  }
}
