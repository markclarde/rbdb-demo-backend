
import { IsString, MinLength, IsInt, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;
  
  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @IsInt()
  role_id: number;

  @IsOptional()
  @IsInt()
  branch_id?: number;
}
