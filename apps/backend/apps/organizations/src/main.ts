import { env } from 'process';

import * as pkg from '../../../package.json';
import bootstrap from '../../common/bootstrap';
import { AppModule } from './app.module';

bootstrap(
  AppModule,
  env.ORGANIZATIONS_PORT || 8001,
  pkg.name,
  pkg.description,
  pkg.version,
);
