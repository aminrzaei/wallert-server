import { Matches, IsJWT } from 'class-validator';

export class ResetPasswordDto {
  // Token
  @IsJWT({
    message: 'توکن استفاده شده نامعتبر است',
  })
  token: string;

  // Password
  @Matches('^(?=.*?[a-zA-Z])(?=.*?[0-9]).{6,}$', undefined, {
    message: 'حداقل طول پسورد 6 کاراکتر و بایستی شامل حداقل یک حرف و عدد باشد.',
  })
  password: string;
}
