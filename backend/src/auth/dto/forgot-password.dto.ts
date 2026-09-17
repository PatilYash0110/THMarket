import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  @IsEmail()
  email: string;
}
