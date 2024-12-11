import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { File } from './models/file.model';
import { User } from './models/user.model';
import { FilesService } from './files.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly filesService: FilesService) {}

  @ResolveField(() => [File], { name: 'files' })
  public listFiles(@Parent() user: User): Promise<File[]> {
    return this.filesService.listFiles(user.id);
  }
}
