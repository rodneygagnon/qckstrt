import { maskSensitiveData } from './pii-masker';

describe('PII Masker', () => {
  describe('maskSensitiveData', () => {
    it('should return null for null input', () => {
      expect(maskSensitiveData(null)).toBeNull();
    });

    it('should return undefined for undefined input', () => {
      expect(maskSensitiveData(undefined)).toBeUndefined();
    });

    it('should return primitive values unchanged', () => {
      expect(maskSensitiveData('hello')).toBe('hello');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(true)).toBe(true);
    });

    describe('sensitive field masking', () => {
      it('should fully mask password fields', () => {
        const input = { password: 'secret123' };
        const result = maskSensitiveData(input);
        expect(result).toEqual({ password: '[REDACTED]' });
      });

      it('should fully mask token fields', () => {
        const input = { accessToken: 'abc123', refreshToken: 'xyz789' };
        const result = maskSensitiveData(input);
        expect(result).toEqual({
          accessToken: '[REDACTED]',
          refreshToken: '[REDACTED]',
        });
      });

      it('should fully mask API key fields', () => {
        const input = { apiKey: 'sk-12345', apiSecret: 'secret' };
        const result = maskSensitiveData(input);
        expect(result).toEqual({
          apiKey: '[REDACTED]',
          apiSecret: '[REDACTED]',
        });
      });

      it('should be case-insensitive for sensitive fields', () => {
        const input = { PASSWORD: 'secret', Token: 'abc', APIKEY: 'key' };
        const result = maskSensitiveData(input);
        expect(result).toEqual({
          PASSWORD: '[REDACTED]',
          Token: '[REDACTED]',
          APIKEY: '[REDACTED]',
        });
      });
    });

    describe('partial masking', () => {
      it('should partially mask email addresses', () => {
        const input = { email: 'john@example.com' };
        const result = maskSensitiveData(input) as { email: string };
        expect(result.email).toBe('j**n@example.com');
      });

      it('should handle short email local parts', () => {
        const input = { email: 'ab@example.com' };
        const result = maskSensitiveData(input) as { email: string };
        expect(result.email).toBe('**@example.com');
      });

      it('should partially mask phone numbers', () => {
        const input = { phone: '1234567890' };
        const result = maskSensitiveData(input) as { phone: string };
        expect(result.phone).toBe('******7890');
      });

      it('should handle phoneNumber field', () => {
        const input = { phoneNumber: '555-123-4567' };
        const result = maskSensitiveData(input) as { phoneNumber: string };
        expect(result.phoneNumber).toContain('4567');
      });
    });

    describe('nested object handling', () => {
      it('should mask sensitive fields in nested objects', () => {
        const input = {
          user: {
            name: 'John',
            credentials: {
              password: 'secret',
              email: 'john@test.com',
            },
          },
        };
        const result = maskSensitiveData(input) as {
          user: {
            name: string;
            credentials: { password: string; email: string };
          };
        };
        expect(result.user.name).toBe('John');
        expect(result.user.credentials.password).toBe('[REDACTED]');
        expect(result.user.credentials.email).toBe('j**n@test.com');
      });

      it('should handle arrays of objects', () => {
        const input = [
          { password: 'pass1', name: 'User1' },
          { password: 'pass2', name: 'User2' },
        ];
        const result = maskSensitiveData(input) as Array<{
          password: string;
          name: string;
        }>;
        expect(result[0].password).toBe('[REDACTED]');
        expect(result[0].name).toBe('User1');
        expect(result[1].password).toBe('[REDACTED]');
        expect(result[1].name).toBe('User2');
      });
    });

    describe('depth limiting', () => {
      it('should stop recursing at max depth', () => {
        // Create deeply nested object
        let obj: Record<string, unknown> = { password: 'deep' };
        for (let i = 0; i < 15; i++) {
          obj = { nested: obj };
        }

        // Should not throw and should return something
        const result = maskSensitiveData(obj);
        expect(result).toBeDefined();
      });
    });

    describe('non-sensitive fields', () => {
      it('should not mask regular fields', () => {
        const input = {
          username: 'john',
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
        };
        const result = maskSensitiveData(input);
        expect(result).toEqual(input);
      });
    });
  });
});
