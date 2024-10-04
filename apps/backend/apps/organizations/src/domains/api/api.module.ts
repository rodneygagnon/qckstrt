import { Module } from '@nestjs/common';

import { BusinessApiController } from './business-api.controller';
import { CultureApiController } from './culture-api.controller';

@Module({
  controllers: [BusinessApiController, CultureApiController],
})
export class ApiModule {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }
}
