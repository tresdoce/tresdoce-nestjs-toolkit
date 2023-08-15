import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  FormatService,
  RedactModule,
  RedactOptions,
  RedactService,
} from '@tresdoce-nestjs-toolkit/utils';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import _ from 'lodash';

import {
  ELK_MODULE_OPTIONS,
  ELK_CLIENT,
  ELK_MODULE_CLIENT_OPTIONS,
  ELK_OMITS_IN_OPTIONS,
} from './constants/elk.constant';
import { createElkClient } from './providers/elk-client.provider';
import { ElkService } from './services/elk.service';
import { ElasticsearchOptions } from './interfaces/elk.interface';

@Global()
@Module({
  imports: [
    ConfigModule,
    RedactModule.registerAsync({
      useFactory: (options: ElasticsearchOptions): RedactOptions => options?.redact || {},
      inject: [ELK_MODULE_OPTIONS],
    }),
  ],
  providers: [
    createElkClient(),
    ElkService,
    RedactService,
    FormatService,
    {
      provide: ELK_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<ElasticsearchOptions> =>
        configService.get<ElasticsearchOptions>('config.elasticsearch'),
      inject: [ConfigService],
    },
    {
      provide: ELK_MODULE_CLIENT_OPTIONS,
      useFactory: (options: ElasticsearchOptions): ClientOptions =>
        _.omit(options, ELK_OMITS_IN_OPTIONS),
      inject: [ELK_MODULE_OPTIONS],
    },
  ],
  exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, ElkService],
})
export class ElkModule implements OnModuleDestroy {
  constructor(
    @Inject(ELK_MODULE_OPTIONS) private readonly options: ClientOptions,
    @Inject(ELK_CLIENT) private readonly elkClient: Client,
  ) {}

  static register(options: ElasticsearchOptions): DynamicModule {
    return {
      global: true,
      module: ElkModule,
      imports: [
        RedactModule.registerAsync({
          useFactory: (options: ElasticsearchOptions): RedactOptions => options?.redact || {},
          inject: [ELK_MODULE_OPTIONS],
        }),
      ],
      providers: [
        createElkClient(),
        ElkService,
        RedactService,
        FormatService,
        {
          provide: ELK_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: ELK_MODULE_CLIENT_OPTIONS,
          useFactory: (options: ElasticsearchOptions): ClientOptions =>
            _.omit(options, ELK_OMITS_IN_OPTIONS),
          inject: [ELK_MODULE_OPTIONS],
        },
      ],
      exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, ElkService],
    };
  }

  async onModuleDestroy() {
    await this.elkClient.close();
  }
}
