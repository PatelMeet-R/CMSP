import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ERRORMESSAGE } from 'src/common/constants/error.message';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    if (!this.configService.get<string>('SMTP_HOST')) {
      throw new Error(ERRORMESSAGE.SMTP_CONNECTION_FAILED);
    }
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private compileTemplate(templateName: string, context: any) {
    const filePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'mail',
      'presentation',
      'templates',
      `${templateName}.hbs`,
    );
    console.log('Template path:', filePath); // debug
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  }
  async sendMail(to: string, subject: string, template: string, context: any) {
    const html = this.compileTemplate(template, context);
    await this.transporter.sendMail({
      from: `<${this.configService.get('EMAIL_FROM')}>`,
      to,
      subject,
      html,
    });
  }
  async sendVerificationEmail(email: string, link: string) {
    return this.sendMail(email, 'Verify Email', 'verify-email', { link });
  }
  async sendResetPassword(email: string, resetUrl: string) {
    return this.sendMail(email, 'Reset Password', 'reset-password', {
      resetUrl,
    });
  }
  async sendRegisterUserInfo(
    email: string,
    userData: {
      email: string;
      password: string;
      role: string;
      branch: string;
      createdBy: string;
      fullName: string;
    },
  ) {
    const loginUrl = this.configService.get<string>('FRONTEND_URL');
    // Prepare template context
    const context = {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      branch: userData.branch,
      createdBy: userData.createdBy,
      fullName: userData.fullName,
      loginUrl: loginUrl,
    };

    // Send email using existing sendMail method
    await this.sendMail(
      email,
      'Your Account Has Been Created',
      'register-user-info',
      context,
    );
  }
}
