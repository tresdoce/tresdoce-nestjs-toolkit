import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  RateLimitModuleAsyncOptions,
  RateLimitModuleOptions,
  RateLimitModuleOptionsFactory,
} from './interfaces/rateLimit.interface';
import { RATE_LIMIT_MODULE_OPTIONS } from './constants/rateLimit.constant';
import { RateLimitService } from './services/rateLimit.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<RateLimitModuleOptions> => ({
        apiPrefix: configService.get<string>('config.project.apiPrefix'),
        apiName: configService.get<string>('config.project.name'),
      }),
      inject: [ConfigService],
    },
    RateLimitService,
  ],
  exports: [RateLimitService, RATE_LIMIT_MODULE_OPTIONS],
})
export class RateLimitModule {
  // Opción 1: Registro sincrónico.
  static register(options: RateLimitModuleOptions): DynamicModule {
    return {
      module: RateLimitModule,
      providers: [{ provide: RATE_LIMIT_MODULE_OPTIONS, useValue: options }, RateLimitService],
      exports: [RateLimitService, RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 2: Registro asíncrono.
  static registerAsync(options: RateLimitModuleAsyncOptions): DynamicModule {
    return {
      module: RateLimitModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        RateLimitService,
      ],
      exports: [RateLimitService, RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 3: Configuración global sincrónica (forRoot).
  static forRoot(options: RateLimitModuleOptions): DynamicModule {
    return {
      global: true,
      module: RateLimitModule,
      providers: [{ provide: RATE_LIMIT_MODULE_OPTIONS, useValue: options }, RateLimitService],
      exports: [RateLimitService, RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 4: Configuración global asíncrona (forRootAsync).
  static forRootAsync(options: RateLimitModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: RateLimitModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        RateLimitService,
      ],
      exports: [RateLimitService, RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Método privado para crear proveedores asíncronos.
  private static createAsyncProviders(options: RateLimitModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const providers: Provider<any>[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass)
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });

    return providers;
  }

  private static createAsyncOptionsProvider(options: RateLimitModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: RATE_LIMIT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    let inject: Type<RateLimitModuleOptionsFactory>[];
    if (options.useExisting) inject = [options.useExisting];
    else if (options.useClass) inject = [options.useClass];

    return {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: RateLimitModuleOptionsFactory,
      ): Promise<RateLimitModuleOptions> => optionsFactory.createOptions(),
      inject,
    };
  }
}
