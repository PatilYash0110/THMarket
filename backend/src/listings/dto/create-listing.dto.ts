import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Kept manually in sync with frontend/src/types/listing.ts's ListingCategory
// union — no shared package in this monorepo to dedupe it.
export const LISTING_CATEGORIES = [
  'Elektronik',
  'Bücher & Skripte',
  'Möbel',
  'Fahrräder',
  'Kleidung',
  'Sonstiges',
] as const;

export class CreateListingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description: string;

  @IsInt()
  @Min(0)
  @Max(100_000_000, { message: 'Preis darf 1.000.000 € nicht überschreiten.' })
  priceCents: number;

  @IsIn(LISTING_CATEGORIES)
  category: string;

  // At least one photo is required — the frontend already enforces this
  // before submitting, but a listing posted straight against the API
  // (Postman, a script, a future client) shouldn't be able to skip it.
  // Not @IsUrl(): kept as plain strings rather than tying this DTO to
  // Cloudinary's URL shape specifically.
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Mindestens ein Foto ist erforderlich.' })
  @ArrayMaxSize(6)
  images: string[];

  @IsBoolean()
  sofortkaufMoeglich: boolean;
}
