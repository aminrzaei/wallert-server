import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor() {}
  //  const FRONTEND_URL = config.env === 'production' ? config.site : 'http://localhost:3000';

  // const transport = nodemailer.createTransport(config.email.smtp);
  // /* istanbul ignore next */
  // if (config.env !== 'test') {
  //   transport
  //     .verify()
  //     .then(() => logger.info('Connected to email server'))
  //     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
  // }

  //  sendEmail = async (to, subject, text, html) => {

  //   const msg = { from: config.email.from, to, subject, text, html };
  //   var request = require('request');
  //   var options = {
  //     'method': 'POST',
  //     'url': 'https://artacode.net/aws/email/v1/send',
  //     'headers': {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     form: {
  //       'to': to,
  //       'subject': subject,
  //       'from': 'info@artacode.net',
  //       'cc': 'test',
  //       'message': html
  //     }
  //   };
  //   console.log(options);
  //   await request(options, function (error, response) {
  //     if (error) throw new Error(error);
  //     console.log("Respose from aws : "+response.body);
  //   });

  //   //await transport.sendMail(msg);
  // };

  //  sendResetPasswordEmail = async (to, token) => {
  //   const subject = 'بازیابی رمز عبور';
  //   // replace this url with the link to the reset password page of your front-end app
  //   const resetPasswordUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  //   const text = `کاربر گرامی, برای بازیابی رمز عبور خود و تعیین رمز جدید این لینک را در مرورگر خود کپی کنید : ${resetPasswordUrl}`;
  //   const html = `کاربر گرامی, برای بازیابی رمز عبور خود و تعیین رمز جدید بر روی این لینک کلیک کنید : <br/><a style="display: inline-block; background: #2e58ff; color: #ffffff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; line-height: 30px; margin: 0; text-decoration: none; text-transform: uppercase; padding: 5px 25px;
  // margin: 13px 0; mso-padding-alt: 0px; border-radius: 5px;" href="${resetPasswordUrl}" target="_blank">فعاسازی ایمیل</a><br/> `;

  //   await sendEmail(to, subject, text, html);
  // };

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
