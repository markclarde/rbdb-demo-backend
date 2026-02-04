import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string, branch_id: number) {
    if (!branch_id) {
      throw new UnauthorizedException('Branch is required');
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: branch_id },
    });

    if (!branch) {
      throw new UnauthorizedException('Invalid branch selected');
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const role_name = user.role.name;

    if (role_name !== 'super_admin') {
      if (user.branch_id !== branch_id) {
        throw new UnauthorizedException(
          'You are not assigned to this branch',
        );
      }
    }

    const permissions = user.role.permissions.map(
      (rp) => rp.permission.name,
    );

    const payload = {
      sub: user.id,
      username: user.username,
      role: role_name,
      permissions,
      branch_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
