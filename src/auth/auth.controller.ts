import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  HttpCode,
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
import { ICustomRequest } from '../../types';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  /**
   * Create new user
   * @param dto
   * @param res
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const { user, tokens } = await this.authService.register(dto);
    const { access, refresh } = tokens;
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.send({ statusCode: 201, user, access_token: access });
  }

  /**
   * Login user
   * @param dto
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    const { access, refresh } = tokens;
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.send({ statusCode: 200, user, access_token: access });
  }

  /**
   * Logout user
   * @param req
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  async logout(
    @Req() req: ICustomRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenId = req.user.refreshToken.id;
    await this.authService.logout(refreshTokenId);
    res.clearCookie('wallert_refresh_token');
    res.send({
      statusCode: 200,
      message: 'از حساب کاربری خود خارج شدید',
    });
  }

  /**
   * Renew refresh token
   * @param req
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  async refreshToken(@Req() req: ICustomRequest, @Res() res: Response) {
    const userId = req.user.sub;
    const { user, tokens } = await this.authService.refreshAuth(userId);
    const { access, refresh } = tokens;
    res.cookie('wallert_refresh_token', refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: refresh.expires,
    });
    res.send({ statusCode: 200, user, access_token: access });
  }

  /**
   * Generate forget password token
   * @param dto
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Res() res: Response) {
    const resetPasswordToken =
      await this.tokenService.generateResetPasswordToken(dto.email);
    await this.emailService.sendResetPasswordEmail(
      dto.email,
      resetPasswordToken,
    );
    res.send({
      statusCode: 200,
      message: 'ایمیل تغییر پسورد برای شما ارسال شد',
    });
  }

  /**
   * Reset user password
   * @param dto
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    await this.authService.resetPassword(dto);
    res.send({
      statusCode: 200,
      message: 'تغییر پسورد با موفقیت انجام شد',
    });
  }

  /**
   * Send email verification email
   * @param dto
   * @param res
   */
  @HttpCode(HttpStatus.OK)
  @Post('send-verification-email')
  async sendVerificationEmail(
    @Body() dto: SendVerificationEmailDto,
    @Res() res: Response,
  ) {
    const verifyEmailToken = await this.tokenService.generateVerifyEmailToken(
      dto.email,
    );
    await this.emailService.sendVerificationEmail(dto.email, verifyEmailToken);
    res.send({
      statusCode: 200,
      message:
        'ایمیل فعالسازی برای شما ارسال شد لطفا ایمیل خود را بررسی نمایید',
    });
  }
}
