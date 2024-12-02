import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';

import { AppModule } from '../src/apps/posts/src/app.module';

import { Post } from '../src/apps/posts/src/domains/posts/models/post.model';
import { PostsService } from 'src/apps/posts/src/domains/posts/posts.service';

const posts: Post[] = [
  { authorId: '1', id: 1, title: 'Lorem Ipsum' },
  { authorId: '1', id: 2, title: 'Foo' },
  { authorId: '2', id: 3, title: 'Bar' },
  { authorId: '2', id: 4, title: 'Hello World' },
];

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const postsService = { findAll: () => posts };

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
      .overrideProvider(PostsService)
      .useValue(postsService)
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
