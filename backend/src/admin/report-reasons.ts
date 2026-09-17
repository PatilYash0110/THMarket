// Mirrors how LISTING_CATEGORIES is shared from create-listing.dto.ts — kept
// in one place, validated via @IsIn(), and mirrored on the frontend for the
// reason dropdown (no shared package in this monorepo to dedupe it).
export const REPORT_REASONS = [
  'Betrug oder Täuschung',
  'Unangemessener Inhalt',
  'Falsche oder irreführende Beschreibung',
  'Spam',
  'Belästigung',
  'Sonstiges',
] as const;
