/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthConfig } from 'src/config';

import { ILogin } from 'src/interfaces/login.interface';

export const isLoggedIn = (login: any): login is ILogin =>
  typeof login === 'object' &&
  'email' in login &&
  'id' in login &&
  'roles' in login &&
  'department' in login &&
  'clearance' in login;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const authConfig: IAuthConfig | undefined =
      configService.get<IAuthConfig>('auth');

    if (!authConfig) {
      throw new Error('Authentication config is missing');
    }

    const region = configService.get<string>('region');
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${authConfig.userPoolId}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      _audience: authConfig.clientId,
      issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any): Promise<ILogin> {
    return Promise.resolve({
      id: payload['sub'],
      email: payload['email'],
      roles: payload['cognito:groups'],
      department: payload['custom:department'],
      clearance: payload['custom:clearance'],
    });
  }
}
