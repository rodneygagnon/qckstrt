import { Field, InputType } from '@nestjs/graphql';
import { IsDefined, IsString, Matches } from 'class-validator';

// @ArgsType()
@InputType()
export class ChangePasswordDto {
  /**
   * Required Fields
   */
  @IsDefined()
  @IsString()
  @Field()
  public accessToken!: string;

  @IsDefined()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  @Field()
  public newPassword!: string;

  @IsDefined()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d@$&+,:;=?@#|'<>.^*()%!-]{8,}$/,
    { message: 'invalid password' },
  )
  @Field()
  public currentPassword!: string;
}
