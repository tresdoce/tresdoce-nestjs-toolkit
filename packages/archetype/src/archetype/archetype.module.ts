import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';

import { ArchetypeController } from './controllers/archetype.controller.js';
import { ArchetypeService } from './services/archetype.service.js';

import { CONFIG_OPTIONS } from './constants/archetype.constants.js';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [ArchetypeController],
  exports: [CONFIG_OPTIONS, ArchetypeController],
  providers: [
    ArchetypeController,
    ArchetypeService,
    {
      provide: CONFIG_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<Typings.AppConfig> =>
        configService.get<Typings.AppConfig>('config'),
      inject: [ConfigService],
    },
  ],
})
export class ArchetypeModule {}
