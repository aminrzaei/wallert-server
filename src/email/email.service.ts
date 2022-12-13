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

  //  sendVerificationEmail = async (to, token) => {
  //   const subject = 'فعالسازی ایمیل';
  //   // replace this url with the link to the email verification page of your front-end app
  //   const verificationEmailUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  //   const text = `کاربر گرامی,
  // برای فعالسازی ایمیل خود این لینک را در مرورگر خود باز کنید : ${verificationEmailUrl}
  // اگر حسابی در این سایت نساخته اید، به این ایمیل توجهی نکنید.`;
  //   const html = `کاربر گرامی,
  // برای فعالسازی ایمیل خود بر روی لینک زیر کلیک کنید : <br/><a style="display: inline-block; background: #2e58ff; color: #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; line-height: 30px; margin: 0; text-decoration: none; text-transform: uppercase; padding: 5px 25px;
  // margin: 13px 0; mso-padding-alt: 0px; border-radius: 5px;" href="${verificationEmailUrl}" target="_blank">فعاسازی ایمیل</a><br/>
  // .اگر حسابی در این سایت نساخته اید، به این ایمیل توجهی نکنید`;

  //   await sendEmail(to, subject, text, html);
  // };
}
