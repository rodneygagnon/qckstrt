import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AWSTextract } from './aws/aws.textract';
import { IFileConfig } from 'src/config';

@Injectable()
export class OCR extends AWSTextract {
  constructor(private configService: ConfigService) {
    const fileConfig: IFileConfig | undefined =
      configService.get<IFileConfig>('file');

    if (!fileConfig) {
      throw new Error('File storage config is missing');
    }

    super(
      configService.get<string>('region') || '',
      fileConfig.snsTopicArn,
      fileConfig.snsRoleArn,
    );
  }
}
