import { Module } from '@nestjs/common';
import { MailService } from './domain/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: 'MAIL_OPTIONS',
      // provide:,

      inject: [ConfigService],
      //  Extract the config and return it as the pure object
      useFactory: (configService: ConfigService) => {
        return configService.get('mail');
      },
    },
    {
      provide: 'APP_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('app');
      },
    },
  ],
  exports: [MailService],
})
export class MailModule {}
