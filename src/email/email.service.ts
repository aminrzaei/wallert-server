import { MailerService } from '@nestjs-modules/mailer/dist';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Post } from '../../types';

@Injectable()
export class EmailService {
  private readonly FRONTEND_URL = this.config.get('frontend.url');

  constructor(
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'info@moonde.ir',
        subject: 'بازنشانی رمز عبور حساب',
        template: 'reset-password',
        context: {
          // Data to be sent to template engine.
          url: `${this.FRONTEND_URL}/auth/reset-password?token=${token}`,
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'info@moonde.ir',
        subject: 'فعالسازی حساب کاربری',
        template: 'verify-email',
        context: {
          // Data to be sent to template engine.
          url: `${this.FRONTEND_URL}/auth/complete-register?token=${token}`,
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }

  async sendTrackEmail(
    to: string,
    posts: Post[],
    trackTitle: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'info@moonde.ir',
        subject: `آگهی های جدید: ${trackTitle}`,
        template: 'track',
        context: {
          // Data to be sent to template engine.
          trackTitle,
          posts,
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }
}
