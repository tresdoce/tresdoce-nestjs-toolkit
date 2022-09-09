import { Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import AspectoClientOptions from '@aspecto/opentelemetry/dist/src/interfaces/AspectoClientOptions';
import AspectoInstrument from '@aspecto/opentelemetry';

import { ASPECTO_MODULE_OPTIONS } from './constants/aspecto.constant';
import { createAspectoClient } from './providers/aspecto.provider';
import { AspectoService } from './services/aspecto.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    //createAspectoClient(),
    //AspectoService,
    {
      provide: ASPECTO_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<Typings.AppConfig>('config.aspecto'),
      inject: [ConfigService],
    },
  ],
  //exports: [AspectoService],
})
/*export class AspectoModule {
  constructor(@Inject(ASPECTO_MODULE_OPTIONS) private readonly options: AspectoClientOptions) {
    AspectoInstrument({ ...this.options });
  }
}*/
export class AspectoModule implements OnModuleInit {
  constructor(@Inject(ASPECTO_MODULE_OPTIONS) private readonly options: AspectoClientOptions) {}

  async onModuleInit(): Promise<void> {
    await AspectoInstrument({ ...this.options });
  }
}
