import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { ERRORMESSAGE } from 'src/common/constants/error.message';
import type { MailModuleOptions } from 'src/config/mail.config';
import type { App } from 'src/config/app.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @Inject('APP_CONFIG') private readonly appConfig: App,
    @Inject('MAIL_OPTIONS') private readonly options: MailModuleOptions,
  ) {
    const mailConfig = this.configService.get('mail');

    if (!this.options.host) {
      throw new Error(ERRORMESSAGE.SMTP_CONNECTION_FAILED);
    }
    this.transporter = nodemailer.createTransport({
      host: this.options.host,
      port: this.options.port,
      secure: false,
      auth: {
        user: this.options.user,
        pass: this.options.pass,
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
    const fromAddress = `<${this.options.from}>`;
    const html = this.compileTemplate(template, context);
    await this.transporter.sendMail({
      from: fromAddress,
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
      designation?: string;
      officeLocation?: string;
      joiningDate?: Date;
    },
  ) {
    // Prepare template context
    const loginUrl = this.appConfig.frontendUrl;
    const formattedDate = userData.joiningDate
      ? new Date(userData.joiningDate).toLocaleDateString('en-IN')
      : null;
    const context = {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      branch: userData.branch,
      createdBy: userData.createdBy,
      fullName: userData.fullName,
      loginUrl: loginUrl,
      designation: userData.designation,
      officeLocation: userData.officeLocation,
      joiningDate: formattedDate,
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
