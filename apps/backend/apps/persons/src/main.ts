import { env } from 'process';

import * as pkg from '../../../package.json';
import bootstrap from '../../common/bootstrap';
import { PersonsModule } from './persons.module';

bootstrap(
  PersonsModule,
  env.PERSONS_PORT || 8002,
  pkg.name,
  pkg.description,
  pkg.version,
);
