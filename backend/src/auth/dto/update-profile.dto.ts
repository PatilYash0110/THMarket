import {
  IsDefined,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_PATTERN,
} from '../password-strength';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  // A password change requires both fields together — @ValidateIf makes each
  // one required only when the other is present, so a name-only update isn't
  // rejected for missing password fields it doesn't need.
  @ValidateIf((dto: UpdateProfileDto) => dto.newPassword !== undefined)
  @IsDefined({ message: 'Aktuelles Passwort ist erforderlich.' })
  @IsString()
  currentPassword?: string;

  @ValidateIf((dto: UpdateProfileDto) => dto.currentPassword !== undefined)
  @IsDefined({ message: 'Neues Passwort ist erforderlich.' })
  @IsString()
  @MinLength(8, {
    message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
  })
  @MaxLength(72)
  @Matches(STRONG_PASSWORD_PATTERN, { message: STRONG_PASSWORD_MESSAGE })
  newPassword?: string;
}
