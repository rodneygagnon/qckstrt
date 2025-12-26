import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

// Input DTOs

@InputType()
export class GeneratePasskeyRegistrationOptionsDto {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class VerifyPasskeyRegistrationDto {
  @Field()
  @IsEmail()
  email!: string;

  @Field(() => GraphQLJSON)
  response!: Record<string, unknown>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  friendlyName?: string;
}

@InputType()
export class GeneratePasskeyAuthenticationOptionsDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}

@InputType()
export class VerifyPasskeyAuthenticationDto {
  @Field()
  @IsString()
  identifier!: string;

  @Field(() => GraphQLJSON)
  response!: Record<string, unknown>;
}

@InputType()
export class DeletePasskeyDto {
  @Field()
  @IsString()
  credentialId!: string;
}

// Output Types

@ObjectType()
export class PasskeyRegistrationOptions {
  @Field(() => GraphQLJSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options!: any;
}

@ObjectType()
export class PasskeyAuthenticationOptions {
  @Field(() => GraphQLJSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options!: any;

  @Field()
  identifier!: string;
}

@ObjectType()
export class PasskeyCredential {
  @Field()
  id!: string;

  @Field({ nullable: true })
  friendlyName?: string;

  @Field({ nullable: true })
  deviceType?: string;

  @Field()
  createdAt!: Date;

  @Field()
  lastUsedAt!: Date;
}
