import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User } from './user.model';

@ObjectType()
export class File {
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
