import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { TokenTypes } from 'types';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

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

  async resetPassword(dto: ResetPasswordDto) {
    const { sub: userId } = await this.tokenService.verifyToken(dto.token);
    const isTokenValid = await this.tokenService.validateToken(
      dto.token,
      TokenTypes.RESET_PASSWORD,
      userId,
    );
    if (!isTokenValid) throw new UnauthorizedException('توکن فاقد اعتبار است');
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('کاربر مورد نظر یافت نشد');
    await this.userService.updateUserById(user.id, { password: dto.password });
    await this.prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: TokenTypes.RESET_PASSWORD,
      },
    });
  }

  async verifyEmail({ token }: VerifyEmailDto) {
    const { sub: userId } = await this.tokenService.verifyToken(token);
    const isTokenValid = await this.tokenService.validateToken(
      token,
      TokenTypes.VERIFY_EMAIL,
      userId,
    );
    if (!isTokenValid) throw new UnauthorizedException('توکن فاقد اعتبار است');
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('کاربر مورد نظر یافت نشد');
    await this.prisma.token.deleteMany({
      where: {
        userId,
        type: TokenTypes.VERIFY_EMAIL,
      },
    });
    await this.userService.updateUserById(userId, { isEmailVerified: true });
  }
}
