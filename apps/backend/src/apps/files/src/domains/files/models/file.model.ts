import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User } from './user.model';
import { IFile } from 'src/interfaces/file.interface';

@ObjectType()
export class File implements IFile {
  @Field(() => ID)
  userId!: string;

  @Field()
  filename!: string;

  @Field()
  size!: number;

  @Field(() => User)
  user?: User;

  @Field()
  public lastModified!: Date;
}
