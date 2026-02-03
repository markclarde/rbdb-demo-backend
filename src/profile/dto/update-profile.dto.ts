import { IsOptional, IsString, IsInt, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsInt()
  branch_id?: number;

  @IsOptional()
  @IsEmail()
  email?: string;
}
