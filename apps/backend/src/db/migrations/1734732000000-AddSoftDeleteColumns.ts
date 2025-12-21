import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add soft delete columns for GDPR/CCPA compliance
 *
 * Adds deletedAt column to users and documents tables to enable
 * soft delete functionality. This supports:
 * - Right to be forgotten (GDPR Article 17)
 * - Data deletion requests (CCPA)
 * - Data recovery within retention period
 *
 * Note: Audit logs are NOT included as they must remain immutable
 * for compliance and legal purposes.
 */
export class AddSoftDeleteColumns1734732000000 implements MigrationInterface {
  name = 'AddSoftDeleteColumns1734732000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deletedAt column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "deletedAt" TIMESTAMPTZ DEFAULT NULL
    `);

    // Add deletedAt column to documents table
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN "deletedAt" TIMESTAMPTZ DEFAULT NULL
    `);

    // Create indexes for efficient soft delete queries
    await queryRunner.query(`
      CREATE INDEX "IDX_users_deletedAt" ON "users" ("deletedAt")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_deletedAt" ON "documents" ("deletedAt")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_deletedAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_deletedAt"`);

    // Remove deletedAt columns
    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN IF EXISTS "deletedAt"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "deletedAt"
    `);
  }
}
