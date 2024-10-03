import { env } from 'process';

import * as pkg from '../../../package.json';
import bootstrap from '../../common/bootstrap';
import { RolesModule } from './roles.module';

bootstrap(
  RolesModule,
  env.ROLES_PORT || 8003,
  pkg.name,
  pkg.description,
  pkg.version,
);