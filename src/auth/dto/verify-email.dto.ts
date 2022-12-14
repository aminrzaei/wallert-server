import { IsJWT } from 'class-validator';

export class VerifyEmailDto {
  // Token
  @IsJWT({
    message: 'توکن استفاده شده نامعتبر است',
  })
  token: string;
}
