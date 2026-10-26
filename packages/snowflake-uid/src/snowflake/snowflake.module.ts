import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SnowflakeService } from './services/snowflake.service.js';
import {
  SNOWFLAKE_MODULE_OPTIONS,
  DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
} from './constants/snowflake.constant.js';
import type { SnowFlakeOptions } from './interfaces/snowflake.interface.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SnowflakeService,
    {
      provide: SNOWFLAKE_MODULE_OPTIONS,
      useFactory: (configService: ConfigService): SnowFlakeOptions => {
        const options = configService.get<SnowFlakeOptions>('config.snowflakeUID') ?? {};
        // Partial configs are merged with the defaults; `undefined` values do not override them.
        const defined = Object.fromEntries(
          Object.entries(options).filter(([, value]) => value !== undefined),
        );
        return { ...DEFAULT_SNOWFLAKE_MODULE_OPTIONS, ...defined };
      },
      inject: [ConfigService],
    },
  ],
  exports: [SnowflakeService, SNOWFLAKE_MODULE_OPTIONS],
})
export class SnowflakeModule {}
