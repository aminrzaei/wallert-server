import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { TokenTypes } from 'types';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private prisma: PrismaService,
  ) {}
  async register(dto: RegisterDto) {
    const user = await this.userService.createUser(dto);
    const tokens = await this.tokenService.generateAuthTokens(user.id);
    delete user.password;
    return { user, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.loginUserWithEmailAndPassword(dto);
    const tokens = await this.tokenService.generateAuthTokens(user.id);
    return { user, tokens };
  }

  async loginUserWithEmailAndPassword(dto: LoginDto) {
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) throw new ForbiddenException('اطلاعات وارد شده نادرست است');
    const pwMatches = await this.userService.verifyPassword(
      user.password,
      dto.password,
    );
    if (!pwMatches) throw new ForbiddenException('اطلاعات وارد شده نادرست است');
    delete user.password;
    return user;
  }

  async logout(refreshToken: string) {
    const refreshTokenDoc = await this.prisma.token.findFirst({
      where: {
        token: refreshToken,
        type: TokenTypes.REFRESH,
        isBlacklisted: false,
      },
    });
    if (!refreshTokenDoc) {
      throw new ForbiddenException('توکن کورد نظر یافت نشد');
    }
    await this.prisma.token.delete({
      where: {
        id: refreshTokenDoc.id,
      },
    });
  }

  async refreshAuth(refreshToken: string) {
    const tokenDoc = await this.prisma.token.findFirst({
      where: { token: refreshToken },
    });
    await this.prisma.token.delete({ where: { id: tokenDoc.id } });
    const tokens = await this.tokenService.generateAuthTokens(tokenDoc.userId);
    const user = await this.prisma.user.findUnique({
      where: { id: tokenDoc.userId },
    });
    delete user.password;
    return { user, tokens };
  }

  // resetPassword = async (resetPasswordToken, newPassword) => {
  //   try {
  //     const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
  //     const user = await userService.getUserById(resetPasswordTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await userService.updateUserById(user.id, { password: newPassword });
  //     await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'تغییر رمز عبور انجام نشد');
  //   }
  // };

  // verifyEmail = async (verifyEmailToken) => {
  //   try {
  //     const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
  //     const user = await userService.getUserById(verifyEmailTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
  //     await userService.updateUserById(user.id, { isEmailVerified: true });
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'فعالسازی ایمیل انجام نشد');
  //   }
  // };
}
