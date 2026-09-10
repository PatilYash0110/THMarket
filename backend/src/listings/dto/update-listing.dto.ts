import {
  ArrayMaxSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { LISTING_CATEGORIES } from './create-listing.dto';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsIn(LISTING_CATEGORIES)
  category?: string;

  // Nicht @IsUrl() — siehe create-listing.dto.ts.
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  images?: string[];

  @IsOptional()
  @IsBoolean()
  sofortkaufMoeglich?: boolean;
}