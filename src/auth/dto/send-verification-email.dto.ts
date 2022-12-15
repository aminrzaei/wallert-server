import { IsEmail } from 'class-validator';

export class SendVerificationEmailDto {
  // Email
  @IsEmail(undefined, {
    message: 'فرمت ایمیل نامعتبر است.',
  })
  email: string;
}
