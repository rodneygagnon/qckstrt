import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// @ArgsType()
@InputType()
export class UpdateUserDto {
  /**
   * Optional Fields
   */
  @IsOptional()
  @IsString()
  @IsEmail()
  @Field({ nullable: true })
  public email?: string;

  @IsOptional()
  @MinLength(6)
  @IsString()
  @Field({ nullable: true })
  public username?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public firstName?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public lastName?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public department?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public clearance?: string;
}
