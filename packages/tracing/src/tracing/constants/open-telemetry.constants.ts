import { excludePaths, Typings } from '@tresdoce-nestjs-toolkit/core';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import * as _ from 'lodash';

export const otelSDK = (options: Typings.IOpenTelemetryConfiguration) => {
  return new NodeSDK({
    spanProcessor: new BatchSpanProcessor(
      new JaegerExporter({
        endpoint: options?.jaegerConfig.endpoint
          ? `${options.jaegerConfig.endpoint}`
          : `${options?.jaegerConfig.host || 'http://localhost:'}:${
              options?.jaegerConfig.port || 14268
            }/api/traces`,
        ...options.jaegerConfig,
      }),
    ),
    contextManager: new AsyncLocalStorageContextManager(),
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
        ignoreIncomingPaths: _.union(excludePaths, options.excludeTracerPaths),
      }),
    ],
    resource: new Resource({
      ...options.resourceAttributes,
      [SemanticResourceAttributes.SERVICE_NAME]: options.serviceName,
    }),
  });
};
