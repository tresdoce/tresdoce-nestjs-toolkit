import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDACT_MODULE_OPTIONS, REDACT_PROVIDER } from './constants/redact.constant.js';
import { redactProvider } from './providers/redact.provider.js';
import {
  RedactModuleAsyncOptions,
  RedactModuleOptions,
  RedactModuleOptionsFactory,
} from './interfaces/index.js';
import { RedactService } from './services/redact.service.js';

/**
 * Target of `register`/`registerAsync`. It is not decorated with `@Global()` because Nest treats
 * a module as global whenever its class has that decorator, ignoring the dynamic `global` flag.
 */
@Module({})
class RedactDynamicModule {}

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
  /**
   * @param isGlobal Registers the providers globally (default `true`). Pass `false` to keep this
   * redaction config local to the importing module.
   */
  static register(_options: RedactModuleOptions, isGlobal: boolean = true): DynamicModule {
    return {
      global: isGlobal,
      module: RedactDynamicModule,
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
      global: _options.isGlobal ?? true,
      module: RedactDynamicModule,
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
