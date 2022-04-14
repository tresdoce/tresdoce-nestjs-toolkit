import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { LivenessController } from './controllers/liveness.controller';
import { ReadinessController } from './controllers/readiness.controller';

import { CONFIG_OPTIONS } from './constants/helth.constants';

@Global()
@Module({
  imports: [ConfigModule, TerminusModule, HttpModule],
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
