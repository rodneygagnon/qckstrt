import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LazyModuleLoader } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './domains/api/api.module';
import { OrgModule } from './domains/org/org.module';
import { LazyModuleFactory } from './factories/lazy-module.factory';

@Module({
  imports: [ConfigModule.forRoot(), ApiModule, OrgModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private lazyModuleLoader: LazyModuleLoader) {
    LazyModuleFactory.instance.setLazyModuleLoader(lazyModuleLoader);
  }
}
