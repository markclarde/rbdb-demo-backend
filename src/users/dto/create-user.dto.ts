
import { IsString, MinLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  role_id: number;
}
