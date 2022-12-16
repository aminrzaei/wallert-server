import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async generateToken(
    userId: number,
    userEmail: string,
    expires: moment.Moment,
    type: TokenTypes,
    secret: string = this.config.get('jwt.jwtSecret'),
  ) {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      email: userEmail,
      type,
    };
    return this.jwt.signAsync(payload, {
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
    const tokenDoc = this.prisma.token.create({
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

  async deleteTokenById(id: number) {
    await this.prisma.token.delete({
      where: {
        id,
      },
    });
  }

  async deleteAllUserTokensByType(userId: number, type: TokenTypes) {
    await this.prisma.token.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }

  async generateAuthTokens(userId: number, userEmail: string) {
    const accessTokenExpires = moment().add(
      this.config.get('jwt.accessExpirationMinutes'),
      'minutes',
    );
    const accessToken = await this.generateToken(
      userId,
      userEmail,
      accessTokenExpires,
      TokenTypes.ACCESS,
    );
    const refreshTokenExpires = moment().add(
      this.config.get('jwt.refreshExpirationDays'),
      'days',
    );
    const refreshToken = await this.generateToken(
      userId,
      userEmail,
      refreshTokenExpires,
      TokenTypes.REFRESH,
    );
    await this.deleteAllUserTokensByType(userId, TokenTypes.REFRESH);
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

  async validateToken(token: string, type: TokenTypes, userId: number) {
    const tokenDoc = await this.prisma.token.findFirst({
      where: {
        type,
        token,
        userId,
        isBlacklisted: false,
      },
    });
    if (!tokenDoc) throw new UnauthorizedException('توکن فاقد اعتبار است');
    return tokenDoc;
  }

  async verifyJwt(jwt: string, type: TokenTypes) {
    try {
      const val = await this.jwt.verifyAsync(jwt, {
        secret: this.config.get('jwt.jwtSecret'),
      });
      if (val.type !== type)
        throw new UnauthorizedException('توکن نامعتبر است است');
      return val;
    } catch {
      throw new UnauthorizedException('توکن منقضی شده است');
    }
  }

  async generateResetPasswordToken(email: string) {
    const user = await this.userService.getUserByEmail(email);
    const expires = moment().add(
      this.config.get('jwt.resetExpirationMinutes'),
      'minutes',
    );
    await this.deleteAllUserTokensByType(user.id, TokenTypes.RESET_PASSWORD);
    const resetPasswordToken = await this.generateToken(
      user.id,
      user.email,
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

  async generateVerifyEmailToken(email: string) {
    const expires = moment().add(
      this.config.get('jwt.verifyEmailExpirationMinutes'),
      'minutes',
    );
    const verifyEmailToken = await this.generateToken(
      -1,
      email,
      expires,
      TokenTypes.VERIFY_EMAIL,
    );
    return verifyEmailToken;
  }
}
