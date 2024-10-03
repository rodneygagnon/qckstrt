import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PersonsController],
  providers: [PersonsService],
})
export class PersonsModule {}
