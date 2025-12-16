const SENSITIVE_FIELDS = new Set([
  'password',
  'newpassword',
  'oldpassword',
  'currentpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'secret',
  'apikey',
  'apisecret',
  'privatekey',
  'ssn',
  'socialsecuritynumber',
  'creditcard',
  'cardnumber',
  'cvv',
  'cvc',
]);

const PARTIAL_MASK_FIELDS = new Set(['email', 'phone', 'phonenumber']);

/**
 * Masks sensitive data in objects for audit logging.
 * Fully redacts sensitive fields (passwords, tokens, etc.)
 * Partially masks PII fields (email, phone)
 */
export function maskSensitiveData(
  data: unknown,
  depth = 0,
  maxDepth = 10,
): unknown {
  if (depth > maxDepth || data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, depth + 1, maxDepth));
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_FIELDS.has(lowerKey)) {
        masked[key] = '[REDACTED]';
      } else if (
        PARTIAL_MASK_FIELDS.has(lowerKey) &&
        typeof value === 'string'
      ) {
        masked[key] = partialMask(value, lowerKey);
      } else {
        masked[key] = maskSensitiveData(value, depth + 1, maxDepth);
      }
    }
    return masked;
  }

  return data;
}

function partialMask(value: string, fieldType: string): string {
  if (fieldType === 'email') {
    const [local, domain] = value.split('@');
    if (local && domain) {
      const maskedLocal =
        local.length > 2
          ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
          : '*'.repeat(local.length);
      return `${maskedLocal}@${domain}`;
    }
  }
  if (fieldType === 'phone' || fieldType === 'phonenumber') {
    if (value.length > 4) {
      return '*'.repeat(value.length - 4) + value.slice(-4);
    }
  }
  return value.length > 4
    ? '*'.repeat(value.length - 4) + value.slice(-4)
    : '*'.repeat(value.length);
}
