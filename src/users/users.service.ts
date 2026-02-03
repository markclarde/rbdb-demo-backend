import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAccount(
    username: string,
    password: string,
    roleId: number,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const roleExists = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role_id: roleId,
      },
      select: {
        id: true,
        username: true,
        role_id: true,
        created_at: true,
      },
    });
  }
}
