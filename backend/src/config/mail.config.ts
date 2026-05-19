import { registerAs } from '@nestjs/config';

export interface MailModuleOptions {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM,
}));
