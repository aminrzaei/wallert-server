import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDto) {
    console.log(dto);
    return this.authService.register();
  }

  @Post('login')
  login() {
    return this.authService.login();
  }
}
