import { IsString, MaxLength, MinLength } from 'class-validator';

export class DeleteUserDto {
  // Required (unlike DeleteListingDto's optional note): deleting an account
  // outright is the most consequential thing admin can do here, and there's
  // no appeal path — this is the only place the reason is ever recorded.
  @IsString()
  @MinLength(1, { message: 'Eine kurze Begründung ist erforderlich.' })
  @MaxLength(500)
  note: string;
}
