import {
  Args,
  ID,
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
    conditions: { id: '{{ userId }}' },
  })
  listFiles(
    @Args({ name: 'userId', type: () => ID }) userId: string,
  ): Promise<File[]> {
    return this.filesService.listFiles(userId);
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Read,
    subject: 'File',
    conditions: { id: '{{ userId }}' },
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
    action: Action.Create,
    subject: 'File',
    conditions: { id: '{{ userId }}' },
  })
  getDownloadUrl(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('filename') filename: string,
  ): Promise<string> {
    return this.filesService.getDownloadUrl(userId, filename);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Delete,
    subject: 'File',
    conditions: { id: '{{ userId }}' },
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
