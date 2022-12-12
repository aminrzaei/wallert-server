import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, TokenTypes } from 'types';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from '../token.service';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['wallert_refresh_token'];
  }
  return token;
};

export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    if (payload.type !== TokenTypes.REFRESH) return null;
    const refreshToken = req.cookies.wallert_refresh_token;
    return { ...payload, refreshToken };
  }
}
