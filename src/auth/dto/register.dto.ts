import {
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  // Name
  @MinLength(3, {
    message: 'حداقل طول نام بایستی 3 کاراکتر باشد.',
  })
  @MaxLength(50, {
    message: 'حداکثر طول نام بایستی 50 کاراکتر باشد.',
  })
  name: string;

  // Email
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;

  // Phone
  @IsPhoneNumber('IR', {
    message: 'شماره تلفن معتبر نیست',
  })
  phone: string;

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
