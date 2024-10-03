import { Test, TestingModule } from '@nestjs/testing';

import { BusinessApiController } from './business-api.controller';

describe('DogsApiController', () => {
  let controller: BusinessApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ BusinessApiController ],
    }).compile();

    controller = module.get<BusinessApiController>(BusinessApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
