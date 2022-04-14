import { Typings } from '@tresdoce-nestjs-toolkit/core';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import * as _ from 'lodash';
import { defaultTraceExcludePaths } from './tracing.constants';

export const otelSDK = (options: Typings.IOpenTelemetryConfiguration) => {
  return new NodeSDK({
    metricExporter: new PrometheusExporter({
      ...options.prometheusExporterConfig,
    }),
    metricInterval: options.metricInterval || 1000,
    spanProcessor: new BatchSpanProcessor(
      new JaegerExporter({
        ...options.jaegerExporterConfig,
      }),
    ),
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new CompositePropagator({
      propagators: [
        new JaegerPropagator(),
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
        new B3Propagator(),
        new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
      ],
    }),
    resource: new Resource({
      ...options.resourceAttributes,
      [SemanticResourceAttributes.SERVICE_NAME]: options.serviceName,
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
      new HttpInstrumentation({
        ignoreIncomingPaths: _.union(defaultTraceExcludePaths, options.excludeTracerPaths),
      }),
    ],
  });
};
