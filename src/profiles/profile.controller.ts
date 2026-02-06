import {
  Controller,
  Patch,
  Body,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { HasPermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constants';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HasPermissions(PERMISSIONS.USER_READ)
  getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.user_id);
  }

  @Patch()
  @HasPermissions(PERMISSIONS.PROFILE_UPDATE)
  updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user, body);
  }
}
