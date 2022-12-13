import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { Request, Response } from 'express';
import { IUserRequest } from 'types';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';
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

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logout(@Req() req: IUserRequest) {
    const refreshToken = req.user.refreshToken;
    return this.authService.logout(refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }

  @Post('refresh-tokens')
  refreshToken() {
    return 'refresh-tokens';
  }

  @Post('forgot-password')
  forgotPassword() {
    return 'forgot-password';
  }
  @Post('reset-password')
  resetPassword() {
    return 'reset-password';
  }

  @Post('send-verification-email')
  sendVerificationEmail() {
    return 'send-verification-email';
  }

  @Post('verify-email')
  verifyEmail() {
    return 'verify-email';
  }
}
