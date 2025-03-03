import {
  Args,
  ID,
  Int,
  Parent,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { File } from './models/file.model';
import { User } from './models/user.model';
import { FilesService } from './files.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Action } from 'src/common/enums/action.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Resolver(() => File)
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  @Query(() => [File])
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Read,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  listFiles(
    @Args({ name: 'userId', type: () => ID }) userId: string,
  ): Promise<File[]> {
    return this.filesService.listFiles(userId);
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Create,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  getUploadUrl(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('filename') filename: string,
  ): Promise<string> {
    return this.filesService.getUploadUrl(userId, filename);
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Read,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  getDownloadUrl(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('filename') filename: string,
  ): Promise<string> {
    return this.filesService.getDownloadUrl(userId, filename);
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Update,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async answerQuery(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('query') query: string,
  ): Promise<string> {
    return this.filesService.answerQuery(userId, query);
  }

  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Read,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async searchText(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('query') query: string,
    @Args({ name: 'count', type: () => Int }) count: number,
  ): Promise<string[]> {
    return this.filesService.searchText(userId, query, count);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Delete,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async deleteFile(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('filename') filename: string,
  ): Promise<boolean> {
    return this.filesService.deleteFile(userId, filename);
  }

  @ResolveField(() => User)
  user(@Parent() file: File): User {
    return { id: file.userId };
  }
}
