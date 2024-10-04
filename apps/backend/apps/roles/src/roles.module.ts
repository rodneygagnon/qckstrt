import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
