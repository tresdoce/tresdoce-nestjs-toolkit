import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/paas';

import { CONFIG_MODULE_OPTIONS } from './constants/camunda.constants';
import { CamundaTaskConnector } from './providers/camunda.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CamundaTaskConnector,
    {
      provide: CONFIG_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<Typings.AppConfig> =>
        configService.get<Typings.AppConfig>('config.camunda'),
      inject: [ConfigService],
    },
  ],
  exports: [],
})
export class CamundaModule {}
