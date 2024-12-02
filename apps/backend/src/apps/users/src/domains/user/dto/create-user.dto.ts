import { Field, InputType } from '@nestjs/graphql';
import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// @ArgsType()
@InputType()
export class CreateUserDto {
  /**
   * Required Fields
   */
  @IsDefined()
  @IsString()
  @IsEmail()
  @Field()
  public email!: string;

  @IsDefined()
  @MinLength(6)
  @IsString()
  @Field()
  public username!: string;

  @IsDefined()
  @MinLength(6)
  @IsString()
  @Field()
  public password!: string;

  /**
   * Optional Fields
   */
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

// TEMPORARY: add dept, clearance, admin, confirm to registerUserDto
