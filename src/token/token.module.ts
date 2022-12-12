import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from 'src/token/strategy/accessToken.strategy';
import { RefreshTokenStrategy } from 'src/token/strategy/refreshToken.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [TokenService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [TokenService],
})
export class TokenModule {}
