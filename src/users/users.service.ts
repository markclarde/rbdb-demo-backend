import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAccount(currentUser: any, body: CreateUserDto) {
    const { username, password, role_id, branch_id } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const roleExists = await this.prisma.role.findUnique({
      where: { id: role_id },
    });

    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }

    if (branch_id) {
      const hasBranchPermission = currentUser.permissions?.includes(
        'BRANCH_ASSIGN',
      );

      if (!hasBranchPermission) {
        throw new BadRequestException(
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
          password: hashedPassword,
          role_id: role_id,
        },
      });

      await tx.profile.create({
        data: {
          user_id: user.id,
          branch_id: branch_id ?? null,
        },
      });

      return {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        branch_id: branch_id ?? null,
      };
    });
  }

  async updateProfile(userId: number, body: UpdateProfileDto) {
    return this.prisma.$transaction(async (tx) => {
      if (body.email) {
        await tx.user.update({
          where: { id: userId },
          data: { email: body.email },
        });
      }

      const existingProfile = await tx.profile.findUnique({
        where: { user_id: userId },
      });

      if (existingProfile) {
        return tx.profile.update({
          where: { user_id: userId },
          data: {
            first_name: body.first_name,
            last_name: body.last_name,
            phone: body.phone,
            branch_id: body.branch_id,
          },
          include: {
            branch: true,
          },
        });
      }

      return tx.profile.create({
        data: {
          user_id: userId,
          first_name: body.first_name,
          last_name: body.last_name,
          phone: body.phone,
          branch_id: body.branch_id,
        },
        include: {
          branch: true,
        },
      });
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
