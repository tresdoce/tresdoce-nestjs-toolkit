import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CatsModule } from './cats/cats.module.js';
import { TracingModule } from '../../tracing/tracing.module.js';
import { TracingInterceptor } from '../../tracing/interceptors/tracing.interceptor.js';

@Module({
  imports: [CatsModule, TracingModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
})
export class AppModule {}
