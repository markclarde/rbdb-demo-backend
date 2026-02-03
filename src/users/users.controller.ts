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
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { HasPermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.USER_CREATE)
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createAccount(
      body.username,
      body.password,
      body.role_id,
    );
  }

  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }
}
