import { DynamicModule, Global, Inject, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  FormatService,
  RedactModule,
  type RedactOptions,
  RedactService,
} from '@tresdoce-nestjs-toolkit/utils';
import type { Client, ClientOptions } from '@elastic/elasticsearch';
import _ from 'lodash';

import {
  ELK_MODULE_OPTIONS,
  ELK_CLIENT,
  ELK_MODULE_CLIENT_OPTIONS,
  ELK_OMITS_IN_OPTIONS,
} from './constants/elk.constant.js';
import { createElkClient } from './providers/elk-client.provider.js';
import { ElkService } from './services/elk.service.js';
import type { ElasticsearchOptions } from './interfaces/elk.interface.js';

const redactModule = (): DynamicModule =>
  // Local: elk's redaction config must not replace the app's global RedactService.
  RedactModule.registerAsync({
    isGlobal: false,
    useFactory: (options: ElasticsearchOptions): RedactOptions => options?.redact || {},
    inject: [ELK_MODULE_OPTIONS],
  });

const elkProviders = (optionsProvider: Provider): Provider[] => [
  createElkClient(),
  ElkService,
  RedactService,
  FormatService,
  optionsProvider,
  {
    provide: ELK_MODULE_CLIENT_OPTIONS,
    useFactory: (options: ElasticsearchOptions): ClientOptions =>
      _.omit(options, ELK_OMITS_IN_OPTIONS),
    inject: [ELK_MODULE_OPTIONS],
  },
];

const elkExports = [ELK_MODULE_OPTIONS, ELK_CLIENT, ElkService];

@Global()
@Module({
  imports: [ConfigModule, redactModule()],
  providers: elkProviders({
    provide: ELK_MODULE_OPTIONS,
    useFactory: async (configService: ConfigService): Promise<ElasticsearchOptions> =>
      configService.get<ElasticsearchOptions>('config.elasticsearch'),
    inject: [ConfigService],
  }),
  exports: elkExports,
})
export class ElkModule implements OnModuleDestroy {
  constructor(@Inject(ELK_CLIENT) private readonly elkClient: Client) {}

  static register(options: ElasticsearchOptions): DynamicModule {
    return {
      global: true,
      module: ElkModule,
      imports: [redactModule()],
      providers: elkProviders({ provide: ELK_MODULE_OPTIONS, useValue: options }),
      exports: elkExports,
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.elkClient.close();
  }
}
