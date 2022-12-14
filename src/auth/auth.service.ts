import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { RegisterDto, LoginDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { TokenTypes } from 'types';

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
    await this.userService.verifyPassword(user.password, dto.password);
    delete user.password;
    return user;
  }

  async logout(refreshTokenId: number) {
    await this.prisma.token.delete({
      where: {
        id: refreshTokenId,
      },
    });
  }

  async refreshAuth(refreshTokenId: number, userId: number) {
    await this.prisma.token.delete({ where: { id: refreshTokenId } });
    const tokens = await this.tokenService.generateAuthTokens(userId);
    const user = await this.userService.getUserById(userId);
    delete user.password;
    return { user, tokens };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { sub: userId } = await this.tokenService.verifyJwt(dto.token);
    await this.tokenService.validateToken(
      dto.token,
      TokenTypes.RESET_PASSWORD,
      userId,
    );
    await this.userService.updateUserById(userId, { password: dto.password });
    await this.prisma.token.deleteMany({
      where: {
        userId,
        type: TokenTypes.RESET_PASSWORD,
      },
    });
  }

  async verifyEmail({ token }: VerifyEmailDto) {
    const { sub: userId } = await this.tokenService.verifyJwt(token);
    await this.tokenService.validateToken(
      token,
      TokenTypes.VERIFY_EMAIL,
      userId,
    );
    await this.prisma.token.deleteMany({
      where: {
        userId,
        type: TokenTypes.VERIFY_EMAIL,
      },
    });
    await this.userService.updateUserById(userId, { isEmailVerified: true });
  }
}
