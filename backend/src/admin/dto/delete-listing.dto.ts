import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeleteListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
