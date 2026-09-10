import { ArrayMaxSize, IsBoolean, IsIn, IsInt, IsString, Min, MinLength } from 'class-validator';

// Manuell synchron gehalten mit frontend/src/types/listing.ts's ListingCategory-
// Union — kein gemeinsames Paket in diesem Monorepo, um das zu deduplizieren.
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
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsIn(LISTING_CATEGORIES)
  category: string;

  // Nicht @IsUrl() — ein Inserat ohne Fotos übermittelt einen lokalen
  // `data:image/svg+xml,...`-Platzhalter (frontend/src/lib/placeholder.ts)
  // neben echten Cloudinary-URLs, und IsUrl würde das data:-Schema ablehnen.
  @IsString({ each: true })
  @ArrayMaxSize(6)
  images: string[];

  @IsBoolean()
  sofortkaufMoeglich: boolean;
}