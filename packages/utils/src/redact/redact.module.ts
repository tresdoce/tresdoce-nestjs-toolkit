import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDACT_MODULE_OPTIONS, REDACT_PROVIDER } from './constants/redact.constant';
import { redactProvider } from './providers/redact.provider';
import {
  RedactModuleAsyncOptions,
  RedactModuleOptions,
  RedactModuleOptionsFactory,
} from './interfaces';
import { RedactService } from './services/redact.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    redactProvider(),
    RedactService,
    {
      provide: REDACT_MODULE_OPTIONS,
      useFactory: async (_configService: ConfigService): Promise<RedactModuleOptions> =>
        _configService.get<RedactModuleOptions>('config.redact') || null,
      inject: [ConfigService],
    },
  ],
  exports: [REDACT_PROVIDER, RedactService],
})
export class RedactModule {
  static register(_options: RedactModuleOptions): DynamicModule {
    return {
      global: true,
      module: RedactModule,
      providers: [
        redactProvider(),
        RedactService,
        {
          provide: REDACT_MODULE_OPTIONS,
          useValue: _options,
        },
      ],
      exports: [REDACT_PROVIDER, RedactService],
    };
  }

  static registerAsync(_options: RedactModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: RedactModule,
      imports: _options.imports,
      providers: [redactProvider(), RedactService, ...this.createAsyncProviders(_options)],
      exports: [REDACT_PROVIDER, RedactService],
    };
  }

  private static createAsyncProviders(_options: RedactModuleAsyncOptions): Provider[] {
    if (_options.useFactory) {
      return [this.createAsyncOptionsProvider(_options)];
    }
    return [
      this.createAsyncOptionsProvider(_options),
      {
        provide: _options.useClass,
        useClass: _options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(_options: RedactModuleAsyncOptions): Provider {
    if (_options.useFactory) {
      return {
        provide: REDACT_MODULE_OPTIONS,
        useFactory: _options.useFactory,
        inject: _options.inject || [],
      };
    }
    return {
      provide: REDACT_MODULE_OPTIONS,
      useFactory: async (
        _optionsFactory: RedactModuleOptionsFactory,
      ): Promise<RedactModuleOptions> => _optionsFactory.createRedactOptions(),
      inject: [_options.useClass],
    };
  }
}
