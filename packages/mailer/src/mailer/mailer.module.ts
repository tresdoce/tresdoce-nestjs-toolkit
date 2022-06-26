import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { MAILER_OPTIONS } from './constants/mailer.constant';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { MailerService } from './services/mailer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MailerService,
    {
      provide: MAILER_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<Typings.AppConfig>('config.mailer'),
      inject: [ConfigService],
    },
  ],
  exports: [MailerService],
})
export class MailerModule {
  public static forRoot(options?: MailerOptions): DynamicModule {
    return {
      global: true,
      module: MailerModule,
      providers: [
        MailerService,
        {
          provide: MAILER_OPTIONS,
          useValue: options,
        },
      ],
      exports: [MailerService],
    };
  }
}
