import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IRelationalDBProvider } from "@qckstrt/common";
import {
  PostgresProvider,
  PostgresConfig,
} from "./providers/postgres.provider.js";

/**
 * Relational Database Module
 *
 * Configures Dependency Injection for relational database providers.
 *
 * Configure via RELATIONAL_DB_PROVIDER environment variable:
 * - postgres (default, via Supabase)
 */
@Module({
  providers: [
    {
      provide: "RELATIONAL_DB_PROVIDER",
      useFactory: (configService: ConfigService): IRelationalDBProvider => {
        const provider =
          configService.get<string>("relationaldb.provider") || "postgres";

        switch (provider.toLowerCase()) {
          case "postgres":
          case "postgresql":
          default:
            const postgresConfig: PostgresConfig = {
              host:
                configService.get<string>("relationaldb.postgres.host") ||
                "localhost",
              port:
                configService.get<number>("relationaldb.postgres.port") || 5432,
              database:
                configService.get<string>("relationaldb.postgres.database") ||
                "postgres",
              username:
                configService.get<string>("relationaldb.postgres.username") ||
                "postgres",
              password:
                configService.get<string>("relationaldb.postgres.password") ||
                "postgres",
              ssl:
                configService.get<boolean>("relationaldb.postgres.ssl") ||
                false,
            };

            return new PostgresProvider(postgresConfig);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ["RELATIONAL_DB_PROVIDER"],
})
export class RelationalDBModule {}
