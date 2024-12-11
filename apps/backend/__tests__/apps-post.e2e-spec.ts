import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';

import { AppModule } from '../src/apps/files/src/app.module';

import { File } from '../src/apps/files/src/domains/files/models/file.model';
import { FilesService } from 'src/apps/files/src/domains/files/files.service';

const files: File[] = [
  { userId: '1', size: 1, filename: 'Lorem Ipsum', lastModified: new Date() },
  { userId: '1', size: 2, filename: 'Foo', lastModified: new Date() },
  { userId: '2', size: 3, filename: 'Bar', lastModified: new Date() },
  { userId: '2', size: 4, filename: 'Hello World', lastModified: new Date() },
];

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const filesService = { findAll: () => files };

  const setupEnv = () => {
    process.env.PROJECT = 'qckstrt-project';
    process.env.APPLICATION = 'qckstrt-application';
    process.env.DESCRIPTION = 'qckstrt-description';
    process.env.VERSION = '0.0';
    process.env.PORT = 3000;
    process.env.AWS_REGION = 'MARS';

    process.env.SECRETS =
      '{"apiKeys":{"mobile":"-token-","postman":"-token-","www":"-token "},"auth":{"userPoolId":"pool-id"}}';

    process.env.DB_HOST = 'qckstrt-db-host';
    process.env.DB_PORT = '0000';
    process.env.DB_USERNAME = 'qckstrt-db-username';
    process.env.DB_PASSWORD = 'qckstrt-db-password';
    process.env.DB_DATABASE = 'qckstrt-db-database';
  };

  beforeAll(async () => {
    setupEnv();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FilesService)
      .useValue(filesService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // it('get posts', () => {
  //   return request(app.getHttpServer())
  //     .post('/api')
  //     .send({ query: '{posts {authorId id title }}' })
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.data.posts).toEqual(posts);
  //     });
  //   // return request(app.getHttpServer())
  //   //   .post('/api')
  //   //   .send({ query: '{getPosts {authorId id title }}' })
  //   //   .expect(200)
  //   //   .expect('Hello World!')
  //   //   .expect((res) => {
  //   //     expect(res.body.data.getPosts).toEqual(posts);
  //   //   });
  // });
});
