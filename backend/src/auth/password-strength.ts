// Shared between RegisterDto, ResetPasswordDto, and UpdateProfileDto — kept
// in one place the same way create-listing.dto.ts shares LISTING_CATEGORIES.
export const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const STRONG_PASSWORD_MESSAGE =
  'Das Passwort muss Groß-, Kleinbuchstaben und mindestens eine Zahl enthalten.';
