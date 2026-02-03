import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HasPermissions } from 'src/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/auth/constants/permissions.constants';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @HasPermissions(PERMISSIONS.USER_CREATE)
  createUser(@Body() body: { username: string; password: string }) {
    return this.usersService.createAccount(body.username, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  getMe(@Req() req) {
    return req.user;
  }
}
