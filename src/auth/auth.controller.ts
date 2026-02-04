import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string; branch_id: number }) {
    return this.authService.login(
      body.username,
      body.password,
      body.branch_id,
    );
  }
}
