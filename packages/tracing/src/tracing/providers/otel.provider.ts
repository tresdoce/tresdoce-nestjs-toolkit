import { Logger } from '@nestjs/common';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
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
import { minimatch } from 'minimatch';
import _ from 'lodash';

import { TracingOptions } from '../interfaces/tracing.interface';
import { DEFAULT_IGNORE_PATHS } from '../constants/tracing.constant';

export const otelProvider = (_options: TracingOptions): void => {
  try {
    const {
      exporter,
      resourceAttributes,
      httpInstrumentation = { requireParentforIncomingSpans: false },
      ignorePaths = [],
    } = _options;

    const ignorePathsToTracing = _.union(DEFAULT_IGNORE_PATHS, ignorePaths);

    const traceExporter = new OTLPTraceExporter({
      ...exporter,
    });

    const spanProcessor = new BatchSpanProcessor(traceExporter);

    const resource = new Resource({
      [ATTR_SERVICE_NAME]: resourceAttributes.serviceName,
      [ATTR_SERVICE_VERSION]: resourceAttributes.version,
      ...resourceAttributes,
    });

    new NodeSDK({
      resource,
      idGenerator: new AWSXRayIdGenerator(),
      spanProcessors: [spanProcessor],
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
          /* istanbul ignore next */
          ignoreIncomingRequestHook(req) {
            /* istanbul ignore next */
            return ignorePathsToTracing.some((ignorePath) => minimatch(req.url, ignorePath));
          },
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
