import { Test, TestingModule } from '@nestjs/testing';

import { CultureApiController } from './culture-api.controller';

describe('CultureApiController', () => {
  let controller: CultureApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ CultureApiController ],
    }).compile();

    controller = module.get<CultureApiController>(CultureApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
