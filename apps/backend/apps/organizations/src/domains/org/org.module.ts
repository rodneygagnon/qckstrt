import { Module } from '@nestjs/common';

import { OrgController } from './org.controller';
import { OrgService } from './org.service';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
})
export class OrgModule {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }
}
