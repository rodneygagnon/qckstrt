import { registerAs } from '@nestjs/config';

/**
 * Auth Configuration
 *
 * Maps AUTH_* environment variables to nested config.
 */
export default registerAs('auth', () => ({
  provider: process.env.AUTH_PROVIDER || 'supabase',
}));
