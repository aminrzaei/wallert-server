import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(3, {
    message: 'حداقل طول نام بایستی 3 کاراکتر باشد.',
  })
  @MaxLength(50, {
    message: 'حداکثر طول نام بایستی 50 کاراکتر باشد.',
  })
  name: string;

  @IsNotEmpty()
  @Matches(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$',
    undefined,
    {
      message:
        'حداقل طول پسورد 8 کاراکتر و بایستی شامل حداقل یک حرف بزرگ، کوچک، عدد و یکی از  کاراکتر های "#?!@$ %^&*-" باشد.',
    },
  )
  password: string;

  @IsOptional()
  @IsPhoneNumber('IR')
  phone?: string;
}
