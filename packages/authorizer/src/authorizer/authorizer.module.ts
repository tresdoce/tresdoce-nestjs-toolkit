import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthorizerProvider } from './providers/authorizer.provider';
import { AuthorizerService } from './services/authorizer.service';
import {
  AuthorizerModuleAsyncOptions,
  AuthorizerModuleOptions,
  AuthorizerModuleOptionsFactory,
} from './interfaces/authorizer.interface';
import {
  AUTHORIZER_MODULE_OPTIONS,
  AUTHORIZER_CLIENT,
} from './constants/authorizer.constant';

@Global()
@Module({
  imports:[ConfigModule],
  providers:[
    AuthorizerProvider(),
    AuthorizerService,
    {
      provide: AUTHORIZER_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<AuthorizerModuleOptions> =>
        configService.get<AuthorizerModuleOptions>('config.authorizer'),
      inject: [ConfigService],
    }
  ],
  exports:[AUTHORIZER_CLIENT, AuthorizerService]
})

export class AuthorizerModule {
  static register(options: AuthorizerModuleOptions): DynamicModule {
    return {
      global: true,
      module: AuthorizerModule,
      providers: [
        ...this.commonProviders(),
        this.getOptionsProvider(options),
      ],
      exports:[AUTHORIZER_CLIENT, AuthorizerService]
    };
  }

  static registerAsync(options: AuthorizerModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: AuthorizerModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.commonProviders(),
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
      ],
      exports:[AUTHORIZER_CLIENT, AuthorizerService]
    };
  }

  static forRoot(options: AuthorizerModuleOptions): DynamicModule {
    return {
      global: true,
      module: AuthorizerModule,
      providers: [
        ...this.commonProviders(),
        this.getOptionsProvider(options)
      ],
      exports:[AUTHORIZER_CLIENT, AuthorizerService]
    };
  }

  static forRootAsync(options: AuthorizerModuleAsyncOptions): DynamicModule {
    return {
      global:true,
      module: AuthorizerModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.commonProviders(),
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
      ],
      exports:[AUTHORIZER_CLIENT, AuthorizerService]
    }
  }

  private static commonProviders(): Provider[]{
    return [
      AuthorizerProvider(),
      AuthorizerService,
    ]
  }

  private static getOptionsProvider(options: AuthorizerModuleOptions): Provider {
    return {
      provide: AUTHORIZER_MODULE_OPTIONS,
      useValue: options
    }
  }

  private static createAsyncProviders(options: AuthorizerModuleAsyncOptions): Provider[] {
    if(options.useExisting || options.useFactory) {
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

  private static createAsyncOptionsProvider(options: AuthorizerModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AUTHORIZER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    let inject: any;
    if (options.useExisting) inject = [options.useExisting];
    else if (options.useClass) inject = [options.useClass];

    return {
      provide: AUTHORIZER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AuthorizerModuleOptionsFactory): Promise<any> =>
        optionsFactory.createAuthorizerOptions(),
      inject,
    };
  }
}
