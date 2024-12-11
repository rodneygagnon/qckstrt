import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class FileUploadDto {
  @IsOptional()
  @IsString()
  @Field(() => ID, { nullable: true })
  id: string;

  @IsString()
  @Field()
  userId!: string;
}
