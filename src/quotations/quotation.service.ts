import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Injectable()
export class QuotationService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuotations() {
    return this.prisma.quotation.findMany({
      include: {
        sales_rep: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async getOne(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        sales_rep: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async create(user: any, dto: CreateQuotationDto) {
    return this.prisma.$transaction(async (tx) => {
      const quotationNumber = await this.generateQuotationNumber(tx);

      return tx.quotation.create({
        data: {
          quotation_number: quotationNumber,
          client_name: dto.client_name,
          amount: dto.amount,
          status: dto.status,
          last_contact_at: dto.last_contact_at
            ? new Date(dto.last_contact_at)
            : null,
          sales_representative_id: user.user_id,
        },
      });
    });
  }

  async update(id: number, dto: UpdateQuotationDto) {
    const existing = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quotation not found');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        ...(dto.client_name !== undefined && {
          client_name: dto.client_name,
        }),
        ...(dto.amount !== undefined && {
          amount: dto.amount,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        ...(dto.last_contact_at !== undefined && {
          last_contact_at: new Date(dto.last_contact_at),
        }),
      },
    });
  }

  async delete(id: number) {
    const existing = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Quotation not found');
    }

    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  private async generateQuotationNumber(tx: any): Promise<string> {
    let unique = false;
    let quotationNumber = '';

    while (!unique) {
      const random = Math.floor(1000 + Math.random() * 9000);
      quotationNumber = `DVO.SAM.EQTN.${random}`;

      const exists = await tx.quotation.findUnique({
        where: { quotation_number: quotationNumber },
      });

      if (!exists) unique = true;
    }

    return quotationNumber;
  }
}
