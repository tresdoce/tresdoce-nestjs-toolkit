import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CONFIG_MODULE_OPTIONS } from './constants/camunda.constants.js';
import type { CamundaOptions } from './interfaces/camunda.interface.js';
import { CamundaTaskConnector } from './providers/camunda.provider.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CamundaTaskConnector,
    {
      provide: CONFIG_MODULE_OPTIONS,
      useFactory: (configService: ConfigService): CamundaOptions =>
        configService.get<CamundaOptions>('config.camunda'),
      inject: [ConfigService],
    },
  ],
  exports: [CamundaTaskConnector],
})
export class CamundaModule {}
