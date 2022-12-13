import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { Response } from 'express';
import { EmailService } from 'src/email/email.service';
import { TokenService } from 'src/token/token.service';
import { IUserRequest } from 'types';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  // @UseGuards(RefreshTokenGuard)
  // @Get('me')
  // me(@Req() req: Request) {
  //   return req.user;
  // }

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
  logout(@Req() req: IUserRequest, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('wallert_refresh_token');
    const refreshToken = req.user.refreshToken;
    return this.authService.logout(refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  async refreshToken(@Req() req: IUserRequest, @Res() res: Response) {
    const doUseSecureCoockie = process.env.NODE_ENV === 'production';
    const refreshToken = req.user.refreshToken;
    const { user, tokens } = await this.authService.refreshAuth(refreshToken);
    const { access, refresh } = tokens;
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
  resetPassword() {
    // await authService.resetPassword(req.query.token, req.body.password);
    // res.status(httpStatus.NO_CONTENT).send();
    return 'reset-password';
  }

  @Post('send-verification-email')
  sendVerificationEmail() {
    // const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
    // await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
    // res.status(httpStatus.NO_CONTENT).send();
    return 'send-verification-email';
  }

  @Post('verify-email')
  verifyEmail() {
    // await authService.verifyEmail(req.query.token);
    // res.status(httpStatus.NO_CONTENT).send();
    return 'verify-email';
  }
}
