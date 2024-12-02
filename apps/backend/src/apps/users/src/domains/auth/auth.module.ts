import { Module, forwardRef } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/providers/auth/jwt.strategy';
import { UsersModule } from '../user/users.module';
import { AWSCognito } from 'src/providers/auth/aws.cognito';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthResolver, AuthService, AWSCognito, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
