import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SnowflakeService } from './services/snowflake.service';
import {
  SNOWFLAKE_MODULE_OPTIONS,
  DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
} from './constants/snowflake.constant';
import { SnowFlakeOptions } from './interfaces/snowflake.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SnowflakeService,
    {
      provide: SNOWFLAKE_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<SnowFlakeOptions> =>
        configService.get<SnowFlakeOptions>('config.snowflakeUID') ||
        DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
      inject: [ConfigService],
    },
  ],
  exports: [SnowflakeService, SNOWFLAKE_MODULE_OPTIONS],
})
export class SnowflakeModule {}
