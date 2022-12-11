import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { tokenTypes } from '../../config/tokens';

@Injectable()
export class TokenService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}
  generateToken = (
    userId,
    expires,
    type,
    secret = this.config.get('jwt.jwtSecret'),
  ) => {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return this.jwt.sign(payload, {
      secret,
    });
  };

  saveToken = async (token, userId, expires, type, isBlacklisted = false) => {
    const tokenDoc = await this.prisma.token.create({
      data: {
        token,
        userId,
        expires: expires.toDate(),
        type,
        isBlacklisted,
      },
    });
    return tokenDoc;
  };

  //   verifyToken = async (token, type) => {
  //     const payload = jwt.verify(token, config.jwt.secret);
  //     const tokenDoc = await Token.findOne({
  //       token,
  //       type,
  //       user: payload.sub,
  //       blacklisted: false,
  //     });
  //     if (!tokenDoc) {
  //       throw new Error('توکن اعتبارسنجی شما یافت است');
  //     }
  //     return tokenDoc;
  //   };

  generateAuthTokens = async (userId: number) => {
    const accessTokenExpires = moment().add(
      this.config.get('jwt.accessExpirationMinutes'),
      'minutes',
    );

    const accessToken = this.generateToken(
      userId,
      accessTokenExpires,
      tokenTypes.ACCESS,
    );
    const refreshTokenExpires = moment().add(
      this.config.get('jwt.refreshExpirationDays'),
      'days',
    );
    const refreshToken = this.generateToken(
      userId,
      refreshTokenExpires,
      tokenTypes.REFRESH,
    );

    await this.saveToken(
      refreshToken,
      userId,
      refreshTokenExpires,
      tokenTypes.REFRESH,
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
  };

  //   generateResetPasswordToken = async (email) => {
  //     const user = await userService.getUserByEmail(email);
  //     if (!user) {
  //       throw new ApiError(httpStatus.NOT_FOUND, 'کاربری با این ایمیل یافت نشد');
  //     }
  //     const expires = moment().add(
  //       config.jwt.resetPasswordExpirationMinutes,
  //       'minutes',
  //     );
  //     const resetPasswordToken = generateToken(
  //       user.id,
  //       expires,
  //       tokenTypes.RESET_PASSWORD,
  //     );
  //     await saveToken(
  //       resetPasswordToken,
  //       user.id,
  //       expires,
  //       tokenTypes.RESET_PASSWORD,
  //     );
  //     return resetPasswordToken;
  //   };

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
