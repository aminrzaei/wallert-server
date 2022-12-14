import { Matches, IsJWT } from 'class-validator';

export class ResetPasswordDto {
  // Token
  @IsJWT({
    message: 'توکن استفاده شده نامعتبر است',
  })
  token: string;

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
