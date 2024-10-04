import { Module } from '@nestjs/common';

import { BusinessService } from './business.service';

@Module({
  providers: [BusinessService],
})
export class BusinessModule {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }
}
