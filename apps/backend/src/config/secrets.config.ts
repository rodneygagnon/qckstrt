import { registerAs } from '@nestjs/config';

/**
 * Secrets Configuration
 *
 * Maps SECRETS_* environment variables to nested config.
 */
export default registerAs('secrets', () => ({
  provider: process.env.SECRETS_PROVIDER || 'supabase',
}));
