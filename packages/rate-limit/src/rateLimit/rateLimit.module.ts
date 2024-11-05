import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

import {
  RateLimitModuleAsyncOptions,
  RateLimitModuleOptionsFactory,
} from './interfaces/rateLimit.interface';
import { RATE_LIMIT_MODULE_OPTIONS } from './constants/rateLimit.constant';
import { RateLimitCoreModule } from './rateLimit-core.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    RateLimitCoreModule.registerAsync(),
  ],
  providers: [
    {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => configService.get<ThrottlerModuleOptions>('config.server.rateLimits'),
      inject: [ConfigService],
    },
  ],
  exports: [RATE_LIMIT_MODULE_OPTIONS],
})

export class RateLimitModule {
  // Opción 1: Registro sincrónico.
  static register(options: ThrottlerModuleOptions): DynamicModule {
    return {
      module: RateLimitModule,
      imports:[RateLimitCoreModule.register(options)],
      providers: [{ provide: RATE_LIMIT_MODULE_OPTIONS, useValue: options }],
      exports: [RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 2: Registro asíncrono.
  static registerAsync(options: RateLimitModuleAsyncOptions): DynamicModule {
    const providers = this.createAsyncProviders(options);

    if (options.useExisting) {
      // Registra `useExisting` como proveedor en el módulo para que esté disponible en el contexto
      providers.push({
        provide: options.useExisting,
        useClass: options.useExisting,
      });
    }

    return {
      module: RateLimitModule,
      imports: [
        ConfigModule,
        ...(options.imports || []),
        RateLimitCoreModule.registerAsync(),
      ],
      providers: [...providers, ...(options.extraProviders || [])],
      exports: [RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 3: Configuración global sincrónica (forRoot).
  static forRoot(options: ThrottlerModuleOptions): DynamicModule {
    return {
      global: true,
      module: RateLimitModule,
      imports:[RateLimitCoreModule.register(options)],
      providers: [{ provide: RATE_LIMIT_MODULE_OPTIONS, useValue: options }],
      exports: [RATE_LIMIT_MODULE_OPTIONS],
    };
  }

  // Opción 4: Configuración global asíncrona (forRootAsync).
  static forRootAsync(options: RateLimitModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: RateLimitModule,
      imports: [
        ConfigModule,
        ...(options.imports || []),
        RateLimitCoreModule.registerAsync(),
      ],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
      ],
      exports: [RATE_LIMIT_MODULE_OPTIONS],
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
      ): Promise<ThrottlerModuleOptions> => optionsFactory.createOptions(),
      inject,
    };
  }
}
