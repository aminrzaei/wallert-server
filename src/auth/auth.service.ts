import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
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

  // logout = async (refreshToken) => {
  //   const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  //   if (!refreshTokenDoc) {
  //     throw new ApiError(httpStatus.NOT_FOUND, 'یافت نشد');
  //   }
  //   await refreshTokenDoc.remove();
  // };

  // refreshAuth = async (refreshToken) => {
  //   try {
  //     const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  //     const user = await userService.getUserById(refreshTokenDoc.user);
  //     if (!user) {
  //       throw new Error();
  //     }
  //     await refreshTokenDoc.remove();
  //     const tokens = await tokenService.generateAuthTokens(user);
  //     return { user, tokens };
  //   } catch (error) {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'لطفاوارد شوید');
  //   }
  // };

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
