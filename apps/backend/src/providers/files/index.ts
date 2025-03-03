import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AWSS3 } from './aws/aws.s3';

@Injectable()
export class Storage extends AWSS3 {
  constructor(private configService: ConfigService) {
    super(configService.get<string>('region') || '');
  }
}
