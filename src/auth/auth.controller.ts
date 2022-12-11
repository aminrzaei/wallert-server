import { Controller, Post, Body, Res } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    const { access, refresh } = tokens;
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.status(HttpStatus.OK).send({ user, access_token: access });
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);
    const { access, refresh } = tokens;
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.status(HttpStatus.OK).send({ user, access_token: access });
  }
}
