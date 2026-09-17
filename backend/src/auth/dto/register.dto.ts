import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_PATTERN,
} from '../password-strength';

const THM_EMAIL_PATTERN = /^[^\s@]+@([a-z0-9-]+\.)*thm\.de$/i;

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  // @IsEmail() removed deliberately — the regex below already fully
  // constrains valid shape for the @thm.de-only case, so pairing it with
  // @IsEmail() only produced two overlapping validation messages on one bad
  // input, never extra real coverage.
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  @Matches(THM_EMAIL_PATTERN, {
    message:
      'Bitte verwende eine gültige @thm.de-Adresse (auch Subdomains wie @mnd.thm.de).',
  })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
  })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_PATTERN, { message: STRONG_PASSWORD_MESSAGE })
  password: string;
}
