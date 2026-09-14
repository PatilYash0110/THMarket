import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const THM_EMAIL_PATTERN = /^[^\s@]+@([a-z0-9-]+\.)*thm\.de$/i;
// At least one lowercase letter, one uppercase letter, and one digit.
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @Matches(THM_EMAIL_PATTERN, {
    message: 'Bitte verwende eine gültige @thm.de-Adresse (auch Subdomains wie @mnd.thm.de).',
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Das Passwort muss mindestens 8 Zeichen lang sein.' })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: 'Das Passwort muss Groß-, Kleinbuchstaben und mindestens eine Zahl enthalten.',
  })
  password: string;
}