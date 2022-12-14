import { MailerService } from '@nestjs-modules/mailer/dist';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly FRONTEND_URL = this.config.get('frontend.url');

  constructor(
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendResetPasswordEmail(to: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'wallert@info.ir',
        subject: 'بازنشانی رمز عبور حساب',
        template: 'reset-password',
        context: {
          // Data to be sent to template engine.
          url: `${this.FRONTEND_URL}/reset-password?token=${token}`,
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'wallert@info.ir',
        subject: 'فعالسازی ایمیل حساب کاربری',
        template: 'verify-email',
        context: {
          // Data to be sent to template engine.
          url: `${this.FRONTEND_URL}/verify-email?token=${token}`,
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }
}
