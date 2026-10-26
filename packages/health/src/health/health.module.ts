import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';

import { LivenessController } from './controllers/liveness.controller.js';
import { ReadinessController } from './controllers/readiness.controller.js';

import { CONFIG_OPTIONS } from './constants.js';

@Global()
@Module({
  imports: [ConfigModule, TerminusModule],
  controllers: [LivenessController, ReadinessController],
  exports: [LivenessController, ReadinessController],
  providers: [
    LivenessController,
    ReadinessController,
    {
      provide: CONFIG_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<Typings.AppConfig>('config'),
      inject: [ConfigService],
    },
  ],
})
export class HealthModule {}
