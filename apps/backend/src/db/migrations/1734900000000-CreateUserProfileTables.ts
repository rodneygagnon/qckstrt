import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create user profile management tables
 *
 * Creates:
 * - user_profiles: Extended user profile data (name, phone, preferences)
 * - user_logins: Login metadata and security tracking
 * - user_sessions: Active session tracking with device info
 * - user_addresses: User addresses with geocoding and civic boundary data
 * - notification_preferences: Email, push, SMS, and civic notification settings
 * - user_consents: GDPR/CCPA consent tracking
 */
export class CreateUserProfileTables1734900000000 implements MigrationInterface {
  name = 'CreateUserProfileTables1734900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "address_type_enum" AS ENUM ('residential', 'mailing', 'business', 'voting')
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_frequency_enum" AS ENUM ('immediate', 'daily_digest', 'weekly_digest', 'never')
    `);

    await queryRunner.query(`
      CREATE TYPE "consent_type_enum" AS ENUM (
        'terms_of_service', 'privacy_policy',
        'marketing_email', 'marketing_sms', 'marketing_push',
        'data_sharing', 'analytics', 'personalization', 'location_tracking',
        'voter_data_collection', 'civic_notifications', 'representative_contact'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "consent_status_enum" AS ENUM ('granted', 'denied', 'withdrawn', 'pending')
    `);

    // ============================================
    // user_profiles table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,

        -- Personal Information
        "firstName" VARCHAR(100),
        "middleName" VARCHAR(100),
        "lastName" VARCHAR(100),
        "displayName" VARCHAR(100),
        "preferredName" VARCHAR(100),
        "dateOfBirth" DATE,

        -- Contact
        "phone" VARCHAR(20),
        "phoneVerifiedAt" TIMESTAMPTZ,

        -- Preferences
        "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Los_Angeles',
        "locale" VARCHAR(10) NOT NULL DEFAULT 'en-US',

        -- Profile
        "avatarUrl" VARCHAR(500),
        "bio" TEXT,

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_profiles_userId" ON "user_profiles" ("userId")
    `);

    // ============================================
    // user_logins table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_logins" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,

        -- Password authentication (optional - for legacy support)
        "passwordHash" VARCHAR(255),

        -- Login tracking
        "lastLoginAt" TIMESTAMPTZ,
        "loginCount" INTEGER NOT NULL DEFAULT 0,

        -- Failed login tracking (for security)
        "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
        "lockedUntil" TIMESTAMPTZ,

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_logins_userId" ON "user_logins" ("userId")
    `);

    // ============================================
    // user_sessions table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

        -- Session identification
        "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
        "refreshToken" VARCHAR(255),

        -- Device information
        "deviceType" VARCHAR(100),
        "deviceName" VARCHAR(255),
        "browser" VARCHAR(255),
        "operatingSystem" VARCHAR(100),

        -- Location information
        "ipAddress" INET,
        "city" VARCHAR(100),
        "region" VARCHAR(100),
        "country" VARCHAR(2),

        -- Session status
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastActivityAt" TIMESTAMPTZ,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "revokedAt" TIMESTAMPTZ,
        "revokedReason" VARCHAR(50),

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_userId" ON "user_sessions" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_userId_isActive" ON "user_sessions" ("userId", "isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_sessions_expiresAt" ON "user_sessions" ("expiresAt")
    `);

    // ============================================
    // user_addresses table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_addresses" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

        -- Address classification
        "addressType" "address_type_enum" NOT NULL DEFAULT 'residential',
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,

        -- Standard address fields
        "label" VARCHAR(255),
        "addressLine1" VARCHAR(255) NOT NULL,
        "addressLine2" VARCHAR(255),
        "city" VARCHAR(100) NOT NULL,
        "state" VARCHAR(100) NOT NULL,
        "postalCode" VARCHAR(20) NOT NULL,
        "country" VARCHAR(2) NOT NULL DEFAULT 'US',

        -- Geocoding data
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "formattedAddress" VARCHAR(255),
        "placeId" VARCHAR(100),
        "geocodedAt" TIMESTAMPTZ,

        -- Civic boundary data (Critical for civic verticals)
        "congressionalDistrict" VARCHAR(50),
        "stateSenatorialDistrict" VARCHAR(50),
        "stateAssemblyDistrict" VARCHAR(50),
        "county" VARCHAR(100),
        "municipality" VARCHAR(100),
        "schoolDistrict" VARCHAR(100),
        "precinctId" VARCHAR(100),
        "pollingPlace" VARCHAR(100),
        "civicDataUpdatedAt" TIMESTAMPTZ,

        -- Verification status
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "verifiedAt" TIMESTAMPTZ,
        "verificationMethod" VARCHAR(50),

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_addresses_userId" ON "user_addresses" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_addresses_userId_addressType" ON "user_addresses" ("userId", "addressType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_addresses_userId_isPrimary" ON "user_addresses" ("userId", "isPrimary")
    `);

    // ============================================
    // notification_preferences table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,

        -- Email Notifications
        "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
        "emailProductUpdates" BOOLEAN NOT NULL DEFAULT true,
        "emailSecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
        "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
        "emailFrequency" "notification_frequency_enum" NOT NULL DEFAULT 'immediate',

        -- Push Notifications
        "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
        "pushProductUpdates" BOOLEAN NOT NULL DEFAULT true,
        "pushSecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
        "pushMarketing" BOOLEAN NOT NULL DEFAULT false,

        -- SMS Notifications
        "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
        "smsSecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
        "smsMarketing" BOOLEAN NOT NULL DEFAULT false,

        -- Civic-specific notifications
        "civicElectionReminders" BOOLEAN NOT NULL DEFAULT true,
        "civicVoterDeadlines" BOOLEAN NOT NULL DEFAULT true,
        "civicBallotUpdates" BOOLEAN NOT NULL DEFAULT true,
        "civicLocalNews" BOOLEAN NOT NULL DEFAULT true,
        "civicRepresentativeUpdates" BOOLEAN NOT NULL DEFAULT true,
        "civicFrequency" "notification_frequency_enum" NOT NULL DEFAULT 'daily_digest',

        -- Quiet hours
        "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
        "quietHoursStart" TIME,
        "quietHoursEnd" TIME,

        -- Unsubscribe tracking
        "unsubscribedAllAt" TIMESTAMPTZ,

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_preferences_userId" ON "notification_preferences" ("userId")
    `);

    // ============================================
    // user_consents table
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_consents" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

        -- Consent details
        "consentType" "consent_type_enum" NOT NULL,
        "status" "consent_status_enum" NOT NULL DEFAULT 'pending',

        -- Version tracking for terms/policies
        "documentVersion" VARCHAR(50),
        "documentUrl" VARCHAR(255),

        -- Consent collection metadata
        "ipAddress" INET,
        "userAgent" VARCHAR(500),
        "collectionMethod" VARCHAR(100),
        "collectionContext" VARCHAR(255),

        -- Timestamps for consent lifecycle
        "grantedAt" TIMESTAMPTZ,
        "deniedAt" TIMESTAMPTZ,
        "withdrawnAt" TIMESTAMPTZ,
        "expiresAt" TIMESTAMPTZ,

        -- Audit fields
        "consentText" TEXT,

        -- Timestamps
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

        -- Unique constraint: one consent per type per user
        CONSTRAINT "UQ_user_consents_userId_consentType" UNIQUE ("userId", "consentType")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_consents_userId" ON "user_consents" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_consents_userId_status" ON "user_consents" ("userId", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop user_consents
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_consents_userId_status"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_consents_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_consents"`);

    // Drop notification_preferences
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_notification_preferences_userId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);

    // Drop user_addresses
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_addresses_userId_isPrimary"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_addresses_userId_addressType"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_addresses_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_addresses"`);

    // Drop user_sessions
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_sessions_expiresAt"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_sessions_userId_isActive"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_sessions_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`);

    // Drop user_logins
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_logins_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_logins"`);

    // Drop user_profiles
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_profiles_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "consent_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "consent_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "notification_frequency_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "address_type_enum"`);
  }
}
