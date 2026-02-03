import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Patch,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { HasPermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.USER_CREATE)
  createUser(@Req() req, @Body() body: CreateUserDto) {
    return this.usersService.createUser(req.user, body);
  }

  @Patch(':id/branch')
  @UseGuards(PermissionsGuard)
  @HasPermissions(PERMISSIONS.BRANCH_ASSIGN)
  updateBranch(
    @Req() req,
    @Param('id') id: string,
    @Body('branch_id') branch_id: number,
  ) {
    return this.usersService.updateUserBranch(
      req.user,
      +id,
      branch_id,
    );
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
