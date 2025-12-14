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
import { DocumentsService } from './documents.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Action } from 'src/common/enums/action.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';

/**
 * Documents Resolver
 *
 * Handles document metadata and file storage operations.
 */
@Resolver(() => File)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

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
    return this.documentsService.listFiles(userId);
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
    return this.documentsService.getUploadUrl(userId, filename);
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
    return this.documentsService.getDownloadUrl(userId, filename);
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
    return this.documentsService.deleteFile(userId, filename);
  }

  @ResolveField(() => User)
  user(@Parent() file: File): User {
    return { id: file.userId };
  }
}
