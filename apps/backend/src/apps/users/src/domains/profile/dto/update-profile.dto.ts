import { Field, InputType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  IsUrl,
  Matches,
  IsTimeZone,
  IsLocale,
} from 'class-validator';

@InputType()
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field({ nullable: true })
  public firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field({ nullable: true })
  public middleName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field({ nullable: true })
  public lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field({ nullable: true })
  public displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field({ nullable: true })
  public preferredName?: string;

  @IsOptional()
  @IsDateString()
  @Field({ nullable: true })
  public dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid E.164 format',
  })
  @Field({ nullable: true })
  public phone?: string;

  @IsOptional()
  @IsTimeZone()
  @Field({ nullable: true })
  public timezone?: string;

  @IsOptional()
  @IsLocale()
  @Field({ nullable: true })
  public locale?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(en|es)$/, {
    message: 'preferredLanguage must be either "en" or "es"',
  })
  @Field({ nullable: true })
  public preferredLanguage?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  @Field({ nullable: true })
  public avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Field({ nullable: true })
  public bio?: string;
}
