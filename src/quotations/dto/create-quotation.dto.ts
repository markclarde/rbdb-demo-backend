import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateQuotationDto {
  @IsString()
  client_name: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsDateString()
  last_contact_at?: string;
}
