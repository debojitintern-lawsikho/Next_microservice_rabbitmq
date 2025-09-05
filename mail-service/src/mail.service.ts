import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async handleUserLogin(data: { email: string; name: string }) {
    this.logger.log(`Sending mail to ${data.email}`);

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: data.email,
      subject: 'Login Notification',
      text: `Hello ${data.name}, you have successfully logged in!`,
    });

    this.logger.log(`Mail sent to ${data.email}`);
  }
}
