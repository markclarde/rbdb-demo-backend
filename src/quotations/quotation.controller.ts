import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { HasPermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Controller('quotations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get()
  @HasPermissions(PERMISSIONS.QUOTATION_READ)
  get() {
    return this.quotationService.getQuotations();
  }

  @Get(':id')
  @HasPermissions(PERMISSIONS.QUOTATION_READ)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.getOne(id);
  }

  @Post()
  @HasPermissions(PERMISSIONS.QUOTATION_CREATE)
  create(@Req() req, @Body() dto: CreateQuotationDto) {
    return this.quotationService.create(req.user, dto);
  }

  @Patch(':id')
  @HasPermissions(PERMISSIONS.QUOTATION_UPDATE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.quotationService.update(id, dto);
  }

  @Delete(':id')
  @HasPermissions(PERMISSIONS.QUOTATION_DELETE)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.delete(id);
  }
}
