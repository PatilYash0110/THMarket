import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateDescriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  hint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}
