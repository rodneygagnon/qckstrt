import { Field, InputType } from '@nestjs/graphql';
import {
  IsDefined,
  IsEmail,
  IsString,
  IsOptional,
  Matches,
  MinLength,
  IsBoolean,
} from 'class-validator';

// @ArgsType()
@InputType()
export class RegisterUserDto {
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
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  @Field()
  public password!: string;

  /**
   * Optional Fields
   */
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public department?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  public clearance?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  public admin?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  public confirm?: boolean = false;
}
