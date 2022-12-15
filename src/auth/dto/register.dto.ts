import { MinLength, MaxLength, Matches, IsJWT } from 'class-validator';

export class RegisterDto {
  // Token
  @IsJWT({
    message: 'توکن استفاده شده نامعتبر است',
  })
  token: string;

  // Name
  @MinLength(3, {
    message: 'حداقل طول نام بایستی 3 کاراکتر باشد.',
  })
  @MaxLength(50, {
    message: 'حداکثر طول نام بایستی 50 کاراکتر باشد.',
  })
  name: string;

  // Password
  @Matches(
    '^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
    undefined,
    {
      message:
        'حداقل طول پسورد 8 کاراکتر و بایستی شامل حداقل یک حرف، عدد و یکی از  کاراکتر های "#?!@$ %^&*-" باشد.',
    },
  )
  password: string;
}
