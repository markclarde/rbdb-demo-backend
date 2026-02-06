import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async getBranches() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'desc' },
    });
  }
}
