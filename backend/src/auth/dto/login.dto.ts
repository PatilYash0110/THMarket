import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
