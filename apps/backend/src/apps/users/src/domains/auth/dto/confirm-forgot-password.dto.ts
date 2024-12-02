import { Field, InputType } from '@nestjs/graphql';
import { IsDefined, IsEmail, IsString, Matches } from 'class-validator';

// @ArgsType()
@InputType()
export class ConfirmForgotPasswordDto {
  /**
   * Required Fields
   */
  @IsDefined()
  @IsString()
  @IsEmail()
  @Field()
  public email!: string;

  @IsDefined()
  @IsString()
  @Field()
  public confirmationCode!: string;

  @IsDefined()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  @Field()
  public password!: string;
}
