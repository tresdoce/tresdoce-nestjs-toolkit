import { Logger } from '@nestjs/common';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { TracingOptions } from '../interfaces/tracing.interface';

export const otelProvider = (_options: TracingOptions): void => {
  try {
    const {
      exporter,
      resourceAttributes,
      httpInstrumentation = { requireParentforIncomingSpans: false },
    } = _options;
    const traceExporter = new OTLPTraceExporter({
      ...exporter,
    });

    const spanProcessor = new BatchSpanProcessor(traceExporter);

    new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: resourceAttributes.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: resourceAttributes.version,
        ...resourceAttributes,
      }),
      idGenerator: new AWSXRayIdGenerator(),
      spanProcessor,
      textMapPropagator: new CompositePropagator({
        propagators: [
          new AWSXRayPropagator(),
          new JaegerPropagator(),
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
          new B3Propagator(),
          new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
        ],
      }),
      instrumentations: [
        new HttpInstrumentation({
          ...httpInstrumentation,
        }),
      ],
    }).start();
    Logger.log('Creating OpenTelemetry provider successfully!', 'TracingModule');
  } catch (_error) {
    /* istanbul ignore next */
    Logger.error('Error creating OpenTelemetry provider: ', _error, 'TracingModule');
  }
};
