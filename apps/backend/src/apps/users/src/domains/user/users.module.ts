import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
