import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field()
  public accessToken!: string;

  @Field()
  public idToken!: string;

  @Field()
  public refreshToken!: string;
}
