import {
  ArrayMaxSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LISTING_CATEGORIES } from './create-listing.dto';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_00, { message: 'Preis darf 1.000.000 € nicht überschreiten.' })
  priceCents?: number;

  @IsOptional()
  @IsIn(LISTING_CATEGORIES)
  category?: string;

  // Not @IsUrl() — see create-listing.dto.ts.
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  images?: string[];

  @IsOptional()
  @IsBoolean()
  sofortkaufMoeglich?: boolean;
}
