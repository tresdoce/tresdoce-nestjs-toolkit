import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      useFactory: async (configService: ConfigService) => configService.get('config.elasticsearch'),
      inject: [ConfigService],
    },
  ],
  exports: [ELK_CLIENT, ElkService],
})
export class ElkModule {}
