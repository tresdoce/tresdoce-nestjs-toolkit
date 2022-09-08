import { Global, Module } from '@nestjs/common';
import { TracingInterceptor } from './interceptors/tracing.interceptor';
import { TracingService } from './services/tracing.service';

@Global()
@Module({
  providers: [TracingService, TracingInterceptor],
  exports: [TracingService, TracingInterceptor],
})
export class TracingModule {}
