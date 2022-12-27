import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, TokenTypes } from '../../../types';
import { TokenService } from '../token.service';
import { Injectable } from '@nestjs/common/decorators';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['wallert_refresh_token'];
  }
  return token;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (payload.type !== TokenTypes.REFRESH) return null;
    const refreshToken = req.cookies.wallert_refresh_token;
    const tokenDoc = await this.tokenService.validateToken(
      refreshToken,
      TokenTypes.REFRESH,
      payload.sub,
    );
    if (!tokenDoc) return null;
    return { ...payload, refreshToken: tokenDoc };
  }
}
