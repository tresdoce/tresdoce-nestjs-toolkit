import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { LoggingService } from './service/logging.service';
import { LOGGING_OPTIONS, LEVEL_OPTIONS } from './constants/logging.constants';
import * as _ from 'lodash';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LoggingService,
    {
      provide: LOGGING_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        await configService.get<Typings.AppConfig>('config'),
      inject: [ConfigService],
    },

    {
      provide: LEVEL_OPTIONS,
      useFactory: (configuration: Typings.AppConfig) => configuration.server.logLevel || 'info',
      inject: [LOGGING_OPTIONS],
    },
  ],

  exports: [LOGGING_OPTIONS, LEVEL_OPTIONS, LoggingService],
})
export class LoggingModule {}
