import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OpenAI } from './openai/open.ai';
import { IAIConfig } from 'src/config';

@Injectable()
export class AI extends OpenAI {
  constructor(private configService: ConfigService) {
    const aiConfig: IAIConfig | undefined = configService.get<IAIConfig>('ai');

    if (!aiConfig) {
      throw new Error('AI config is missing');
    }

    super(aiConfig);
  }
}
