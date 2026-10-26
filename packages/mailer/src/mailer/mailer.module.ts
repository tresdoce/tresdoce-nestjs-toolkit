import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MAILER_OPTIONS } from './constants/mailer.constant.js';
import type { MailerOptions } from './interfaces/mailer-options.interface.js';
import { MailerService } from './services/mailer.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MailerService,
    {
      provide: MAILER_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<MailerOptions>('config.mailer'),
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
