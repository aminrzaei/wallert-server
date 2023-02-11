import { IsEmail, Matches } from 'class-validator';

export class LoginDto {
  // Email
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;
  // Password
  @Matches('^(?=.*?[a-zA-Z])(?=.*?[0-9]).{6,}$', undefined, {
    message: 'حداقل طول پسورد 6 کاراکتر و بایستی شامل حداقل یک حرف و عدد باشد.',
  })
  password: string;
}
