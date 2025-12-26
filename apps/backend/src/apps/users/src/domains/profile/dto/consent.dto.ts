import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ConsentType,
  ConsentStatus,
} from 'src/db/entities/user-consent.entity';

// Re-export enum registration for GraphQL
registerEnumType(ConsentType, {
  name: 'ConsentType',
  description: 'Type of consent',
});

registerEnumType(ConsentStatus, {
  name: 'ConsentStatus',
  description: 'Status of consent',
});

@InputType()
export class UpdateConsentDto {
  @IsEnum(ConsentType)
  @Field(() => ConsentType)
  public consentType!: ConsentType;

  @IsBoolean()
  @Field()
  public granted!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Field({ nullable: true })
  public documentVersion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Field({ nullable: true })
  public documentUrl?: string;
}

@InputType()
export class BulkUpdateConsentsDto {
  @IsNotEmpty()
  @Field(() => [UpdateConsentDto])
  public consents!: UpdateConsentDto[];
}

@InputType()
export class WithdrawConsentDto {
  @IsEnum(ConsentType)
  @Field(() => ConsentType)
  public consentType!: ConsentType;
}
