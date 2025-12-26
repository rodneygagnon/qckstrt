import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, IsOptional } from 'class-validator';

@InputType()
export class SendMagicLinkDto {
  @Field()
  @IsEmail()
  email!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  redirectTo?: string;
}

@InputType()
export class VerifyMagicLinkDto {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  token!: string;
}

@InputType()
export class RegisterWithMagicLinkDto {
  @Field()
  @IsEmail()
  email!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  redirectTo?: string;
}
