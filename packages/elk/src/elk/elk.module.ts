import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CONFIG_MODULE_OPTIONS } from './constants/elk.constant';
import { ElkService } from './services/elk.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ElkService,
    {
      provide: CONFIG_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) => configService.get('config.elasticsearch'),
      inject: [ConfigService],
    },
  ],
  exports: [ElkService],
})
export class ElkModule {}
