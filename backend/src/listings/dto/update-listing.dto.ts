import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LISTING_CATEGORIES } from './create-listing.dto';

export class UpdateListingDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000, { message: 'Preis darf 1.000.000 € nicht überschreiten.' })
  priceCents?: number;

  @IsOptional()
  @IsIn(LISTING_CATEGORIES)
  category?: string;

  // Not @IsUrl() — see create-listing.dto.ts. @ArrayMinSize still applies
  // when images is present at all — @IsOptional only allows omitting the
  // field entirely (leave existing photos untouched), not submitting an
  // empty array to strip every photo from a listing.
  @IsOptional()
  @IsString({ each: true })
  @Matches(/^https:\/\/res\.cloudinary\.com\//, { each: true })
  @ArrayMinSize(1, { message: 'Mindestens ein Foto ist erforderlich.' })
  @ArrayMaxSize(6)
  images?: string[];

  @IsOptional()
  @IsBoolean()
  sofortkaufMoeglich?: boolean;
}
