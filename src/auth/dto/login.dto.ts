import { IsEmail, Matches } from 'class-validator';

export class LoginDto {
  // Email
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;
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
