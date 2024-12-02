import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  authorId: string;

  @Field(() => User)
  user?: User;
}
