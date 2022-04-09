import { DynamicModule, Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

import { LivenessController } from './controllers/liveness.controller';
import { ReadinessController } from './controllers/readiness.controller';

import { CONFIG_OPTIONS } from './constants';

@Global()
@Module({})
export class HealthModule {
  static register(config): DynamicModule {
    return {
      global: true,
      module: HealthModule,
      imports: [TerminusModule, HttpModule],
      controllers: [LivenessController, ReadinessController],
      exports: [LivenessController, ReadinessController],
      providers: [
        LivenessController,
        ReadinessController,
        {
          provide: CONFIG_OPTIONS,
          useValue: config,
        },
      ],
    };
  }
}
