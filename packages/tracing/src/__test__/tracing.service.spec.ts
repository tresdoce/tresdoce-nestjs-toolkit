import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import * as api from '@opentelemetry/api';
import { otelSDK } from '../lib/constants/open-telemetry.constants';
import { TracingService } from '../lib/services/tracing.service';
import { TracingModule } from '../lib/tracing.module';

let service: TracingService;
const mockedOTELConfiguration: Typings.IOpenTelemetryConfiguration = {
  serviceName: 'test OTEL',
  prometheusExporterConfig: {
    port: 89248,
  },
  metricInterval: 1000,
  jaegerExporterConfig: {
    endpoint: 'http://localhost:14268/api/traces',
  },
};
describe('TracingService', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TracingModule],
    }).compile();
    app = module.createNestApplication();
    await otelSDK(mockedOTELConfiguration).start();
    await app.init;
    service = module.get<TracingService>(TracingService);
  }, 10000);

  it('should be defined', () => {
    service.getSpan();
    service.getSpanContext();
    service.setSpanTags(api.trace.getSpan(api.context.active()), {
      'tracing-tag': '27',
    });
    expect(service).toBeDefined();
  });
});
