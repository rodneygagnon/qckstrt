import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

import { IUser } from 'src/interfaces/user.interface';

@ObjectType()
@Directive('@key(fields: "id")')
export class User implements IUser {
  @Field(() => ID)
  public id!: string;

  @Field()
  public email!: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  public created!: Date;

  @Field({ nullable: true })
  public updated!: Date;
}
