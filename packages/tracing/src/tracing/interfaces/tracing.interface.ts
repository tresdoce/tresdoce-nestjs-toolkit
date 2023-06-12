import { ResourceAttributes } from '@opentelemetry/resources/build/src/types';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { HttpInstrumentationConfig } from '@opentelemetry/instrumentation-http/build/src/types';

interface IResourceAttributes extends ResourceAttributes {
  serviceName: string;
  version: string;
  'service.namespace': string;
  'deployment.environment': string;
}

export interface TracingOptions {
  resourceAttributes: IResourceAttributes;
  exporter: OTLPExporterNodeConfigBase;
  httpInstrumentation?: HttpInstrumentationConfig;
}
