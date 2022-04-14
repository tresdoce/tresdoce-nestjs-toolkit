import { Module } from '@nestjs/common';
import { TracingInterceptor } from './interceptors/tracing.interceptor';
import { TracingService } from './services/tracing.service';

@Module({
  providers: [TracingService, TracingInterceptor],
  exports: [TracingService, TracingInterceptor],
})
export class TracingModule {}
