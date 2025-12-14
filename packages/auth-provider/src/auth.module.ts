import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CognitoAuthProvider } from "./providers/cognito.provider.js";

/**
 * Auth Module
 *
 * Provides authentication capabilities using pluggable providers.
 * Currently supports AWS Cognito.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CognitoAuthProvider,
    {
      provide: "AUTH_PROVIDER",
      useExisting: CognitoAuthProvider,
    },
  ],
  exports: [CognitoAuthProvider, "AUTH_PROVIDER"],
})
export class AuthModule {}
