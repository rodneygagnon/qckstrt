/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { File } from './models/file.model';
import { FilesService } from './files.service';
import { UsersResolver } from './users.resolver';

import { files } from '../../../../data.spec';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let filesService: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: FilesService, useValue: createMock<FilesService>() },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve files of a user', () => {
    filesService.listFiles = jest.fn().mockImplementation((userId: string) => {
      return files;
    });

    const result = resolver.listFiles({ id: '1' });
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: 'a',
        }),
      ]),
    );
  });
});
