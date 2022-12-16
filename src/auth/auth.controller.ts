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
import { Response } from 'express';
import { EmailService } from 'src/email/email.service';
import { TokenService } from 'src/token/token.service';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendVerificationEmailDto,
} from './dto';
import { IUserRequest } from 'types';
import { AccessTokenGuard } from './guards/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
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
  async login(@Body() dto: LoginDto, @Res() res: Response) {
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
  async logout(
    @Req() req: IUserRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenId = req.user.refreshToken.id;
    await this.authService.logout(refreshTokenId);
    res.clearCookie('wallert_refresh_token');
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: 'از حساب کاربری خود خارج شدید',
    });
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  async refreshToken(@Req() req: IUserRequest, @Res() res: Response) {
    const userId = req.user.sub;
    const { user, tokens } = await this.authService.refreshAuth(userId);
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

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response) {
    const resetPasswordToken =
      await this.tokenService.generateResetPasswordToken(dto.email);
    await this.emailService.sendResetPasswordEmail(
      dto.email,
      resetPasswordToken,
    );
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: 'ایمیل تغییر پسورد برای شما ارسال شد',
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    await this.authService.resetPassword(dto);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: 'تغییر پسورد با موفقیت انجام شد',
    });
  }

  @Post('send-verification-email')
  async sendVerificationEmail(
    @Body() dto: SendVerificationEmailDto,
    @Res() res: Response,
  ) {
    const verifyEmailToken = await this.tokenService.generateVerifyEmailToken(
      dto.email,
    );
    await this.emailService.sendVerificationEmail(dto.email, verifyEmailToken);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message:
        'ایمیل فعالسازی برای شما ارسال شد لطفا ایمیل خود را بررسی نمایید',
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  me(@Req() req: IUserRequest, @Res() res: Response) {
    res.send(req.user);
  }
}
