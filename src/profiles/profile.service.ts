import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user_id: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            status: true,
            role: {
              select: { name: true },
            },
            branch: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(user: any, dto: UpdateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { user_id: user.user_id },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.email) {
        const emailExists = await tx.user.findUnique({
          where: { email: dto.email },
        });

        if (emailExists && emailExists.id !== user.user_id) {
          throw new BadRequestException('Email already in use');
        }

        await tx.user.update({
          where: { id: user.user_id },
          data: { email: dto.email },
        });
      }

      const updatedProfile = await tx.profile.update({
        where: { user_id: user.user_id },
        data: {
          ...(dto.first_name !== undefined && { first_name: dto.first_name }),
          ...(dto.last_name !== undefined && { last_name: dto.last_name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              status: true,
              role: { select: { name: true } },
              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return updatedProfile;
    });
  }
}
