import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { CONFIG_MODULE_OPTIONS, ELK_CLIENT } from './constants/elk.constant';
import { createElkClient } from './providers/elk-client.provider';
import { ElkService } from './services/elk.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    createElkClient(),
    ElkService,
    {
      provide: CONFIG_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<Typings.AppConfig>('config.elasticsearch'),
      inject: [ConfigService],
    },
  ],
  exports: [ELK_CLIENT, ElkService],
})
export class ElkModule {}
