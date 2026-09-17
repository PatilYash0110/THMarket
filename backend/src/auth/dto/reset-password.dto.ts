import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_PATTERN,
} from '../password-strength';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, {
    message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
  })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_PATTERN, { message: STRONG_PASSWORD_MESSAGE })
  newPassword: string;
}
