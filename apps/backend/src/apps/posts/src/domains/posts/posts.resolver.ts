import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Post } from './models/post.model';
import { User } from './models/user.model';
import { PostsService } from './posts.service';
import { ParseIntPipe } from '@nestjs/common';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'posts' })
  getPosts(): Post[] {
    return this.postsService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  getPost(
    @Args({ name: 'id', type: () => ID }, ParseIntPipe) id: number,
  ): Post {
    return this.postsService.findOne(id);
  }

  @ResolveField(() => User)
  user(@Parent() post: Post): User {
    return { id: post.authorId };
  }
}
