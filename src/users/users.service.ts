import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        created_at: true,

        role: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
          },
        },

        profile: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async createUser(currentUser: any, body: CreateUserDto) {
    const { username, password, role_id, branch_id, email } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    if (email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }
    }

    const roleExists = await this.prisma.role.findUnique({
      where: { id: role_id },
    });

    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }

    if (branch_id) {
      const hasBranchPermission =
        currentUser.permissions?.includes('BRANCH_ASSIGN');

      if (!hasBranchPermission) {
        throw new ForbiddenException(
          'You are not allowed to assign branch',
        );
      }

      const branchExists = await this.prisma.branch.findUnique({
        where: { id: branch_id },
      });

      if (!branchExists) {
        throw new NotFoundException('Branch not found');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role_id,
          branch_id: branch_id ?? null,
        },
      });

      await tx.profile.create({
        data: {
          user_id: user.id,
        },
      });

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        branch_id: user.branch_id,
      };
    });
  }

  async updateUserBranch(
    currentUser: any,
    targetUserId: number,
    branch_id: number,
  ) {
    if (!currentUser.permissions?.includes('BRANCH_ASSIGN')) {
      throw new ForbiddenException('You are not allowed to assign branch');
    }

    const branchExists = await this.prisma.branch.findUnique({
      where: { id: branch_id },
    });

    if (!branchExists) {
      throw new NotFoundException('Branch not found');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { branch_id },
      select: {
        id: true,
        username: true,
        branch: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateUserStatus(userId: number, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        username: true,
        status: true,
      },
    });
  }
}
