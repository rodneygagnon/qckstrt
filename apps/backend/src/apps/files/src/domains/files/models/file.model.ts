import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User } from './user.model';
import { IFile } from 'src/interfaces/file.interface';

import { DocumentStatus } from 'src/common/enums/document.status.enum';

@ObjectType()
export class File implements IFile {
  @Field(() => ID)
  userId!: string;

  @Field()
  filename!: string;

  @Field()
  size!: number;

  @Field()
  status!: DocumentStatus;

  @Field(() => User)
  user?: User;

  @Field()
  public createdAt!: Date;

  @Field()
  public updatedAt!: Date;
}
