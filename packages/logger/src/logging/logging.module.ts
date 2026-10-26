import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RedactModule,
  RedactOptions,
  RedactService,
  FormatService,
} from '@tresdoce-nestjs-toolkit/utils';

import { LOGGING_MODULE_OPTIONS } from './constants/logging.constants.js';
import type { LoggerModuleOptions } from './interfaces/logging.interface.js';
import { LoggingService } from './service/logging.service.js';

@Global()
@Module({
  imports: [
    ConfigModule,
    // Local: the logger's redaction config must not replace the app's global RedactService.
    RedactModule.registerAsync({
      isGlobal: false,
      useFactory: (configService: ConfigService): RedactOptions => {
        const options = configService.get<LoggerModuleOptions>('config.logger');
        return options?.redact;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: LOGGING_MODULE_OPTIONS,
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerModuleOptions>('config.logger'),
      inject: [ConfigService],
    },
    LoggingService,
    RedactService,
    FormatService,
  ],
  exports: [LoggingService],
})
export class LoggingModule {}
