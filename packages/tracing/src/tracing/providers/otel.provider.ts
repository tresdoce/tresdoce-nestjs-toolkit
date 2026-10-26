import { Logger } from '@nestjs/common';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

import type { TracingOptions } from '../interfaces/tracing.interface.js';
import { buildIgnorePaths, createIgnoreIncomingRequestHook } from '../utils/tracing.util.js';

/** `deployment.environment.name` (semconv incubating, reemplaza a `deployment.environment`). */
const ATTR_DEPLOYMENT_ENVIRONMENT_NAME = 'deployment.environment.name';

/**
 * Inicializa y arranca el SDK de OpenTelemetry (exporter OTLP HTTP/protobuf,
 * instrumentación HTTP y propagadores W3C, Baggage, B3 y AWS X-Ray).
 *
 * Debe llamarse antes de crear la app de Nest para que la instrumentación HTTP
 * pueda parchear los módulos `http`/`https`.
 *
 * @returns la instancia de `NodeSDK` iniciada (para llamar a `shutdown()` al
 * cerrar la app) o `undefined` si no se pudo inicializar.
 */
export const otelProvider = (_options: TracingOptions): NodeSDK | undefined => {
  try {
    const { exporter, resourceAttributes, httpInstrumentation, ignorePaths } = _options;
    const { serviceName, version, ...attributes } = resourceAttributes;
    const ignorePathsToTracing = buildIgnorePaths(ignorePaths);

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: version,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: attributes['deployment.environment'],
      ...attributes,
    });

    const sdk = new NodeSDK({
      resource,
      idGenerator: new AWSXRayIdGenerator(),
      // NodeSDK envuelve el exporter en un BatchSpanProcessor.
      traceExporter: new OTLPTraceExporter({ ...exporter }),
      textMapPropagator: new CompositePropagator({
        propagators: [
          new AWSXRayPropagator(),
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
          new B3Propagator(),
          new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
        ],
      }),
      instrumentations: [
        new HttpInstrumentation({
          requireParentforIncomingSpans: false,
          ignoreIncomingRequestHook: createIgnoreIncomingRequestHook(ignorePathsToTracing),
          ...httpInstrumentation,
        }),
      ],
    });
    sdk.start();
    Logger.log('Creating OpenTelemetry provider successfully!', 'TracingModule');
    return sdk;
  } catch (_error) {
    Logger.error(
      'Error creating OpenTelemetry provider',
      _error instanceof Error ? _error.stack : String(_error),
      'TracingModule',
    );
    return undefined;
  }
};
