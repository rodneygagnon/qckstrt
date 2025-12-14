import { Module, forwardRef } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from 'src/common/auth/jwt.strategy';
import { UsersModule } from '../user/users.module';
import { AuthModule as AuthProviderModule } from '@qckstrt/auth-provider';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
    AuthProviderModule,
  ],
  providers: [AuthResolver, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
