import { Test, TestingModule } from '@nestjs/testing';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

const mockPosts: Post[] = [
  { authorId: '1', id: 1, title: 'Mock Post' },
  { authorId: '1', id: 2, title: 'Mock Post' },
];

const postsServiceMock = {
  findOne: jest.fn((id: number): Post | undefined =>
    mockPosts.find((post) => post.id === id),
  ),
  findAll: jest.fn((): Post[] => mockPosts),
};

describe('PostsResolver', () => {
  let resolver: PostsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        { provide: PostsService, useValue: postsServiceMock },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should query for a single post', () => {
    const result = resolver.getPost(1);
    expect(result.id).toEqual(1);
  });

  it('should query all posts', () => {
    const result = resolver.getPosts();
    expect(Array.isArray(result)).toEqual(true);
  });

  it('should resolve the user of a post', () => {
    const result = resolver.user(mockPosts[0]);
    expect(result).toEqual(
      expect.objectContaining({
        id: mockPosts[0].authorId,
      }),
    );
  });
});
