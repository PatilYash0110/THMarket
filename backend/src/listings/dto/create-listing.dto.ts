import { ArrayMaxSize, IsBoolean, IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

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
  @Max(100_000_00, { message: 'Preis darf 1.000.000 € nicht überschreiten.' })
  priceCents: number;

  @IsIn(LISTING_CATEGORIES)
  category: string;

  // Not @IsUrl() — a listing with zero photos submits a single local
  // `data:image/svg+xml,...` placeholder (frontend/src/lib/placeholder.ts)
  // alongside real Cloudinary URLs, and IsUrl rejects the data: scheme.
  @IsString({ each: true })
  @ArrayMaxSize(6)
  images: string[];

  @IsBoolean()
  sofortkaufMoeglich: boolean;
}
