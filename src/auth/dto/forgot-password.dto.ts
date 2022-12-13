import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  // Email
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;
}
