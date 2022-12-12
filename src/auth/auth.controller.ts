import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

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
    const doUseSecureCoockie = process.env.NODE_ENV === 'production';
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: doUseSecureCoockie,
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
    const doUseSecureCoockie = process.env.NODE_ENV === 'production';
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: doUseSecureCoockie,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.status(HttpStatus.OK).send({ user, access_token: access });
  }
}
