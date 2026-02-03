import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Patch
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { HasPermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { CreateUserDto, UpdateUserStatusDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.USER_CREATE)
  createUser(@Req() req, @Body() body: CreateUserDto) {
    return this.usersService.createAccount(
      req.user,
      body,
    );
  }

  @Patch('me/profile')
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.PROFILE_UPDATE)
  updateMyProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.USER_STATUS_UPDATE)
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(+id, body.status);
  }

  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }
}
