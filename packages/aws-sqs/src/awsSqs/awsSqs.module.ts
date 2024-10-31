import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  AwsSqsModuleAsyncOptions,
  AwsSqsModuleOptions,
  AwsSqsModuleOptionsFactory,
} from './interfaces/awsSqs.interface';
import { AWS_SQS_MODULE_OPTIONS } from './constants/awsSqs.constant';
import { AwsSqsService } from './services/awsSqs.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AWS_SQS_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<AwsSqsModuleOptions> => ({
        apiPrefix: configService.get<string>('config.project.apiPrefix'),
        apiName: configService.get<string>('config.project.name'),
      }),
      inject: [ConfigService],
    },
    AwsSqsService,
  ],
  exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS],
})
export class AwsSqsModule {
  // Opción 1: Registro sincrónico.
  static register(options: AwsSqsModuleOptions): DynamicModule {
    return {
      module: AwsSqsModule,
      providers: [{ provide: AWS_SQS_MODULE_OPTIONS, useValue: options }, AwsSqsService],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS],
    };
  }

  // Opción 2: Registro asíncrono.
  static registerAsync(options: AwsSqsModuleAsyncOptions): DynamicModule {
    return {
      module: AwsSqsModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        AwsSqsService,
      ],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS],
    };
  }

  // Opción 3: Configuración global sincrónica (forRoot).
  static forRoot(options: AwsSqsModuleOptions): DynamicModule {
    return {
      global: true,
      module: AwsSqsModule,
      providers: [{ provide: AWS_SQS_MODULE_OPTIONS, useValue: options }, AwsSqsService],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS],
    };
  }

  // Opción 4: Configuración global asíncrona (forRootAsync).
  static forRootAsync(options: AwsSqsModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: AwsSqsModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        AwsSqsService,
      ],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS],
    };
  }

  // Método privado para crear proveedores asíncronos.
  private static createAsyncProviders(options: AwsSqsModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: AwsSqsModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AWS_SQS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    let inject: Type<AwsSqsModuleOptionsFactory>[];
    if (options.useExisting) inject = [options.useExisting];
    else if (options.useClass) inject = [options.useClass];

    return {
      provide: AWS_SQS_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: AwsSqsModuleOptionsFactory,
      ): Promise<AwsSqsModuleOptions> => optionsFactory.createOptions(),
      inject,
    };
  }
}
