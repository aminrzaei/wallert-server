import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { TokenTypes } from 'types';

@Injectable()
export class TokenService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  generateToken(
    userId: number,
    expires: moment.Moment,
    type: TokenTypes,
    secret: string = this.config.get('jwt.jwtSecret'),
  ) {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return this.jwt.sign(payload, {
      secret,
    });
  }

  async saveToken(
    token: string,
    userId: number,
    expires: moment.Moment,
    type: TokenTypes,
    isBlacklisted = false,
  ) {
    const tokenDoc = await this.prisma.token.create({
      data: {
        token,
        userId,
        expires: expires.format(),
        type,
        isBlacklisted,
      },
    });
    return tokenDoc;
  }

  async generateAuthTokens(userId: number) {
    const accessTokenExpires = moment().add(
      this.config.get('jwt.accessExpirationMinutes'),
      'minutes',
    );

    const accessToken = this.generateToken(
      userId,
      accessTokenExpires,
      TokenTypes.ACCESS,
    );
    const refreshTokenExpires = moment().add(
      this.config.get('jwt.refreshExpirationDays'),
      'days',
    );
    const refreshToken = this.generateToken(
      userId,
      refreshTokenExpires,
      TokenTypes.REFRESH,
    );

    await this.saveToken(
      refreshToken,
      userId,
      refreshTokenExpires,
      TokenTypes.REFRESH,
    );

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  }

  async verifyToken(token: string, type: TokenTypes, userId: number) {
    const tokenDoc = await this.prisma.token.findFirst({
      where: {
        type,
        token,
        userId,
        isBlacklisted: false,
      },
    });
    const isTokenValid = !!tokenDoc;
    return isTokenValid;
  }

  async generateResetPasswordToken(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('کاربری با این ایمیل یافت نشد');
    }
    const expires = moment().add(
      this.config.get('jwt.resetExpirationMinutes'),
      'minutes',
    );
    const resetPasswordToken = this.generateToken(
      user.id,
      expires,
      TokenTypes.RESET_PASSWORD,
    );
    await this.saveToken(
      resetPasswordToken,
      user.id,
      expires,
      TokenTypes.RESET_PASSWORD,
    );
    return resetPasswordToken;
  }

  //   generateVerifyEmailToken = async (user) => {
  //     const expires = moment().add(
  //       config.jwt.verifyEmailExpirationMinutes,
  //       'minutes',
  //     );
  //     const verifyEmailToken = generateToken(
  //       user.id,
  //       expires,
  //       tokenTypes.VERIFY_EMAIL,
  //     );
  //     await saveToken(
  //       verifyEmailToken,
  //       user.id,
  //       expires,
  //       tokenTypes.VERIFY_EMAIL,
  //     );
  //     return verifyEmailToken;
  //   };
}
