import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create tables for WebAuthn/Passkey authentication
 *
 * Creates:
 * - passkey_credentials: Stores user passkey credentials (public keys, counters)
 * - webauthn_challenges: Temporary storage for WebAuthn challenges (5 min TTL)
 */
export class CreatePasskeyTables1734800000000 implements MigrationInterface {
  name = 'CreatePasskeyTables1734800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create passkey_credentials table
    await queryRunner.query(`
      CREATE TABLE "passkey_credentials" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "credentialId" TEXT NOT NULL UNIQUE,
        "publicKey" TEXT NOT NULL,
        "counter" BIGINT NOT NULL DEFAULT 0,
        "aaguid" VARCHAR(36),
        "deviceType" VARCHAR(50),
        "backedUp" BOOLEAN NOT NULL DEFAULT false,
        "friendlyName" VARCHAR(255),
        "transports" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index for fast user lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_passkey_credentials_userId" ON "passkey_credentials" ("userId")
    `);

    // Index for credential lookup during authentication
    await queryRunner.query(`
      CREATE INDEX "IDX_passkey_credentials_credentialId" ON "passkey_credentials" ("credentialId")
    `);

    // Create webauthn_challenges table
    await queryRunner.query(`
      CREATE TABLE "webauthn_challenges" (
        "identifier" VARCHAR(255) PRIMARY KEY,
        "challenge" TEXT NOT NULL,
        "type" VARCHAR(20) NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMPTZ NOT NULL
      )
    `);

    // Index for efficient cleanup of expired challenges
    await queryRunner.query(`
      CREATE INDEX "IDX_webauthn_challenges_expiresAt" ON "webauthn_challenges" ("expiresAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop webauthn_challenges
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_webauthn_challenges_expiresAt"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "webauthn_challenges"`);

    // Drop passkey_credentials
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_passkey_credentials_credentialId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_passkey_credentials_userId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "passkey_credentials"`);
  }
}
