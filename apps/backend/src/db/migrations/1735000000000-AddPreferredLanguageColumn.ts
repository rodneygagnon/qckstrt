import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add preferredLanguage column to user_profiles
 *
 * Adds a preferredLanguage column to support i18n with initial support for:
 * - en (English) - default
 * - es (Spanish)
 */
export class AddPreferredLanguageColumn1735000000000 implements MigrationInterface {
  name = 'AddPreferredLanguageColumn1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      ADD COLUMN "preferredLanguage" VARCHAR(5) NOT NULL DEFAULT 'en'
    `);

    // Add check constraint for valid language codes
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      ADD CONSTRAINT "check_preferred_language"
      CHECK ("preferredLanguage" IN ('en', 'es'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      DROP CONSTRAINT IF EXISTS "check_preferred_language"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_profiles"
      DROP COLUMN IF EXISTS "preferredLanguage"
    `);
  }
}
