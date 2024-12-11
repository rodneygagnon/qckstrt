/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { FilesService } from './files.service';
import { AWSS3 } from 'src/providers/files/aws.s3';
import { ConfigService } from '@nestjs/config';

import { files } from 'src/apps/data.spec';

describe('FilesService', () => {
  let fileService: FilesService;
  let awsS3: AWSS3;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: AWSS3, useValue: createMock<AWSS3>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile();

    fileService = module.get<FilesService>(FilesService);
    awsS3 = module.get<AWSS3>(AWSS3);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
    expect(awsS3).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should list all files for a user', async () => {
    awsS3.listFiles = jest.fn().mockImplementation((userId: string) => {
      const Contents = files.map((file: any) => {
        return {
          Key: `${userId}/${file.filename}`,
          Size: file.size,
          LastModified: file.lastModified,
        };
      });

      return Promise.resolve({ Contents });
    });

    expect(await fileService.listFiles('a')).toEqual(files);
    expect(awsS3.listFiles).toHaveBeenCalledTimes(1);
  });

  it('should get a file upload url', async () => {
    awsS3.getSignedUrl = jest
      .fn()
      .mockImplementation(
        (userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(`http://aws.s3.com/${userId}/${filename}`);
        },
      );

    expect(await fileService.getUploadUrl(files[0].userId, 'myfile.pdf')).toBe(
      `http://aws.s3.com/${files[0].userId}/myfile.pdf`,
    );
    expect(awsS3.getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should get a file download url', async () => {
    awsS3.getSignedUrl = jest
      .fn()
      .mockImplementation(
        (userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(`http://aws.s3.com/${userId}/${filename}`);
        },
      );

    expect(
      await fileService.getDownloadUrl(files[0].userId, 'myfile.pdf'),
    ).toBe(`http://aws.s3.com/${files[0].userId}/myfile.pdf`);
    expect(awsS3.getSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should delete a file', async () => {
    awsS3.deleteFile = jest
      .fn()
      .mockImplementation(
        (userId: string, filename: string, upload: boolean) => {
          return Promise.resolve(true);
        },
      );

    expect(await fileService.deleteFile(files[0].userId, 'myfile.pdf')).toBe(
      true,
    );
    expect(awsS3.deleteFile).toHaveBeenCalledTimes(1);
  });
});
