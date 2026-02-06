import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  last_contact_at?: string;
}
