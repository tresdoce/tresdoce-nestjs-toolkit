import { Global, Module } from '@nestjs/common';
import { TracingService } from './services/tracing.service';
import { TracingInterceptor } from './interceptors/tracing.interceptor';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';

@Global()
@Module({
  providers: [TracingService, TracingInterceptor, FormatService],
  exports: [TracingService, TracingInterceptor],
})
export class TracingModule {}
