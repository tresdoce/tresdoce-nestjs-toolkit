import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { LOGGING_MODULE_OPTIONS, LOGGING_MODULE_PROVIDER } from './constants/logging.constant';
import { createLogging } from './providers/logging.provider';
import { LoggingService } from './services/logging.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    createLogging(),
    LoggingService,
    {
      provide: LOGGING_MODULE_OPTIONS,
      useFactory: async (configService?: ConfigService) =>
        await configService.get<Typings.AppConfig>('config.server.logging'),
      inject: [ConfigService],
    },
  ],
  exports: [LOGGING_MODULE_PROVIDER, LoggingService],
})
export class LoggingModule {}
//https://docs.nestjs.com/techniques/logger
//https://github.com/winstonjs/winston#streams-objectmode-and-info-objects
//https://www.discoduroderoer.es/como-crear-un-logger-en-nestjs/
//https://github.com/tresdoce/nestjs-toolkit-galicia/blob/master/packages/logging/src/lib/service/logging.service.ts
//https://github.com/gremo/nest-winston/blob/e50244187fd17a22db85c9027114dd1c93584649/src/winston.providers.ts#L7
