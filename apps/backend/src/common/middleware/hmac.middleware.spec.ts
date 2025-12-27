import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto-js';

import { HMACMiddleware } from './hmac.middleware';

describe('HMACMiddleware', () => {
  let middleware: HMACMiddleware;
  let configService: ConfigService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const apiKeys = new Map<string, string>([
    ['testclient', 'test-secret-key'],
    ['anotherclient', 'another-secret-key'],
  ]);

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue(apiKeys),
    } as unknown as ConfigService;

    middleware = new HMACMiddleware(configService);

    mockRequest = {
      method: 'POST',
      path: '/graphql',
      headers: {
        'content-type': 'application/json',
        host: 'localhost:3000',
      },
    };

    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('constructor', () => {
    it('should initialize with API keys from config', () => {
      expect(middleware).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('apiKeys');
    });

    it('should initialize with empty map when no API keys configured', () => {
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      const emptyMiddleware = new HMACMiddleware(emptyConfigService);
      expect(emptyMiddleware).toBeDefined();
    });
  });

  describe('use', () => {
    it('should skip HMAC validation for OPTIONS requests', () => {
      mockRequest.method = 'OPTIONS';

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call validateRequest for non-OPTIONS requests', async () => {
      mockRequest.headers = {};

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateRequest', () => {
    it('should throw UnauthorizedException when X-HMAC-Auth header is missing', async () => {
      mockRequest.headers = {};

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when X-HMAC-Auth header format is invalid', async () => {
      mockRequest.headers = {
        'x-hmac-auth': 'invalid-format',
      };

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when X-HMAC-Auth prefix is not hmac', async () => {
      mockRequest.headers = {
        'x-hmac-auth': 'bearer eyJhbGciOiJIUzI1NiJ9',
      };

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should validate request with hmac-sha256 algorithm successfully', async () => {
      const headers = '@request-target,content-type,host';
      const signatureString = `post /graphql\ncontent-type: application/json\nhost: localhost:3000`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA256(signatureString, 'test-secret-key'),
      );

      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha256',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
        'content-type': 'application/json',
        host: 'localhost:3000',
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate request with hmac-sha1 algorithm successfully', async () => {
      const headers = '@request-target,content-type';
      const signatureString = `post /graphql\ncontent-type: application/json`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA1(signatureString, 'test-secret-key'),
      );

      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha1',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
        'content-type': 'application/json',
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate request with hmac-sha512 algorithm successfully', async () => {
      const headers = '@request-target';
      const signatureString = `post /graphql`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA512(signatureString, 'test-secret-key'),
      );

      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha512',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when signature does not match', async () => {
      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha256',
        headers: '@request-target',
        signature: 'invalid-signature',
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
      };

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when username is not found', async () => {
      const headers = '@request-target';
      const signatureString = `post /graphql`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA256(signatureString, 'unknown-key'),
      );

      const credentials = JSON.stringify({
        username: 'unknownclient',
        algorithm: 'hmac-sha256',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
      };

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unsupported algorithm', async () => {
      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-md5',
        headers: '@request-target',
        signature: 'some-signature',
      });

      mockRequest.headers = {
        'x-hmac-auth': `hmac ${credentials}`,
      };

      await expect(
        middleware.use(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle array header value', async () => {
      const headers = '@request-target';
      const signatureString = `post /graphql`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA256(signatureString, 'test-secret-key'),
      );

      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha256',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': [`hmac ${credentials}`],
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate request with HMAC prefix case-insensitively', async () => {
      const headers = '@request-target';
      const signatureString = `post /graphql`;
      const signature = crypto.enc.Base64.stringify(
        crypto.HmacSHA256(signatureString, 'test-secret-key'),
      );

      const credentials = JSON.stringify({
        username: 'testclient',
        algorithm: 'hmac-sha256',
        headers,
        signature,
      });

      mockRequest.headers = {
        'x-hmac-auth': `HMAC ${credentials}`,
      };

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
