import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TRACING_MODULE_OPTIONS, TRACING_PROVIDER } from './constants/tracing.constant';
import { tracingProvider } from './providers/tracing.provider';
import { TracingService } from './services/tracing.service';
import { TracingInterceptor } from './interceptors/tracing.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    tracingProvider(),
    TracingService,
    TracingInterceptor,
    {
      provide: TRACING_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) => configService.get<any>('config.tracing'),
      inject: [ConfigService],
    }
  ],
  exports: [TRACING_PROVIDER, TracingService, TracingInterceptor],
})
export class TracingModule {
}
