import { Global, Module } from '@nestjs/common';
import { TracingService } from './services/tracing.service';
import { TracingInterceptor } from './interceptors/tracing.interceptor';

@Global()
@Module({
  providers: [TracingService, TracingInterceptor],
  exports: [TracingService, TracingInterceptor],
})
export class TracingModule {}
