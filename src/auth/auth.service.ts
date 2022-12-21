import { Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto';
import { CreateUserDate, TokenTypes } from 'types';
import { Token, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}
  async register(dto: RegisterDto) {
    const { email } = await this.tokenService.verifyJwt(
      dto.token,
      TokenTypes.VERIFY_EMAIL,
    );
    const createUserData: CreateUserDate = {
      name: dto.name,
      password: dto.password,
      email,
    };
    const user = await this.userService.createUser(createUserData);
    const tokens = await this.tokenService.generateAuthTokens(
      user.id,
      user.email,
    );
    delete user.password;
    return { user, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.loginUserWithEmailAndPassword(dto);
    const tokens = await this.tokenService.generateAuthTokens(
      user.id,
      user.email,
    );
    return { user, tokens };
  }

  async loginUserWithEmailAndPassword(dto: LoginDto): Promise<User> {
    const user = await this.userService.getUserByEmail(dto.email);
    await this.userService.verifyPassword(user.password, dto.password);
    delete user.password;
    return user;
  }

  logout(refreshTokenId: number): Promise<Token> {
    return this.tokenService.deleteTokenById(refreshTokenId);
  }

  async refreshAuth(userId: number) {
    const user = await this.userService.getUserById(userId);
    const tokens = await this.tokenService.generateAuthTokens(
      userId,
      user.email,
    );
    delete user.password;
    return { user, tokens };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { sub: userId } = await this.tokenService.verifyJwt(
      dto.token,
      TokenTypes.RESET_PASSWORD,
    );
    const resetToken = await this.tokenService.validateToken(
      dto.token,
      TokenTypes.RESET_PASSWORD,
      userId,
    );
    await this.tokenService.deleteTokenById(resetToken.id);
    await this.userService.updateUserById(userId, { password: dto.password });
  }
}
