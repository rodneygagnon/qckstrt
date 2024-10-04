import { Module } from '@nestjs/common';

import { CultureService } from './culture.service';

@Module({
  providers: [CultureService],
})
export class CultureModule {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }
}
