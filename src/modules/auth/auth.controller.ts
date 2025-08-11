import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from 'src/modules/auth/auth.service';
import { SkipAuth } from 'src/modules/auth/skip-auth.decorator';
import { LoginDto } from 'src/modules/auth/interfaces/dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @SkipAuth()
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
