import { DynamicModule, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, Subject } from './casl-ability.factory';
import { Action } from 'src/common/enums/action.enum';
import { Subject as CaslSubject } from '@casl/ability';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {
  static forRoot<
    A extends string = Action,
    S extends CaslSubject = Subject,
  >(): DynamicModule {
    return {
      module: CaslModule,
      providers: [
        Reflector,
        // DynamicModelFetcher,
        {
          provide: CaslAbilityFactory,
          useClass: CaslAbilityFactory<A, S>,
        },
        // {
        //   provide: PoliciesGuard,
        //   useClass: PoliciesGuard<A, S>,
        // },
      ],
      exports: [
        Reflector,
        // DynamicModelFetcher,
        CaslAbilityFactory,
        // PoliciesGuard,
      ],
    };
  }
}
