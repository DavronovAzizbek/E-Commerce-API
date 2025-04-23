import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

enum Role {
  Admin = 'Admin',
  User = 'User',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  fullName: string;
}
