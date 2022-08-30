import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { ELK_MODULE_OPTIONS, ELK_CLIENT } from './constants/elk.constant';
import { createElkClient } from './providers/elk-client.provider';
import { ElkService } from './services/elk.service';
import { Client, ClientOptions } from '@elastic/elasticsearch';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    createElkClient(),
    ElkService,
    {
      provide: ELK_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<Typings.AppConfig>('config.elasticsearch'),
      inject: [ConfigService],
    },
  ],
  exports: [ELK_CLIENT, ElkService],
})
export class ElkModule implements OnModuleDestroy {
  constructor(
    @Inject(ELK_MODULE_OPTIONS) private readonly options: ClientOptions,
    @Inject(ELK_CLIENT) private readonly elkClient: Client,
  ) {}

  static register(options: ClientOptions): DynamicModule {
    return {
      global: true,
      module: ElkModule,
      providers: [
        createElkClient(),
        ElkService,
        {
          provide: ELK_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [ELK_CLIENT, ElkService],
    };
  }

  async onModuleDestroy() {
    await this.elkClient.close();
  }
}
