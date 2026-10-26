import type { DetectedResourceAttributes } from '@opentelemetry/resources';
import type { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import type { HttpInstrumentationConfig } from '@opentelemetry/instrumentation-http';

/** Configuración del exporter OTLP (HTTP/protobuf), p. ej. `{ url, headers, timeoutMillis }`. */
export type TracingExporterOptions = NonNullable<
  ConstructorParameters<typeof OTLPTraceExporter>[0]
>;

export interface IResourceAttributes extends DetectedResourceAttributes {
  serviceName: string;
  version: string;
  'service.namespace': string;
  'deployment.environment': string;
}

export interface TracingOptions {
  resourceAttributes: IResourceAttributes;
  exporter: TracingExporterOptions;
  httpInstrumentation?: HttpInstrumentationConfig;
  ignorePaths?: string[];
}
