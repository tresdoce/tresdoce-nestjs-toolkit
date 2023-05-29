import { Provider } from '@nestjs/common';
import * as api from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

import * as _ from 'lodash';

import { defaultExcludePaths, TRACING_MODULE_OPTIONS, TRACING_PROVIDER } from '../constants/tracing.constant';

export const tracingProvider = (): Provider => ({
  provide: TRACING_PROVIDER,
  useFactory: async (options: any): Promise<any> => {
    try {
      console.log(`TRACING_PROVIDER - options: `, options);
      const { exporterType, serviceName, endpoint, resourceAttributes, excludePaths } = options;

      const resource = Resource.default().merge(
        new Resource({
          ...resourceAttributes,
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
      );

      const provider = new NodeTracerProvider({
        resource,
        idGenerator: new AWSXRayIdGenerator(),
      });

      /*const exporter = exporterType === 'jaeger' ? new JaegerExporter({
          endpoint,
        }) :
        new OTLPTraceExporter({
          url: endpoint,
        });*/

      //const processor = new BatchSpanProcessor(exporter);
      //provider.addSpanProcessor(processor);

      const jaegerExporter = new JaegerExporter({
        endpoint,
      })
      const otlpExporter = new OTLPTraceExporter({
        url: endpoint,
      });

      provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
      provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

      /*provider.register({
        propagator: new AWSXRayPropagator(),
      });
      provider.register({
        propagator: new JaegerPropagator(),
      });
      provider.register({
        propagator: new W3CTraceContextPropagator(),
      });
      provider.register({
        propagator: new W3CBaggagePropagator(),
      });
      provider.register({
        propagator: new B3Propagator(),
      });
      provider.register({
        propagator: new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
      });*/

      api.propagation.setGlobalPropagator(
        new CompositePropagator({
          propagators: [
            new AWSXRayPropagator(),
            new JaegerPropagator(),
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator(),
            new B3Propagator(),
            new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
          ],
        })
      );

      registerInstrumentations({
        instrumentations: [
          new HttpInstrumentation({
            ignoreIncomingPaths: _.union(defaultExcludePaths, excludePaths),
          }),
        ],
      });


      /*const provider = new NodeSDK({
        spanProcessor: new BatchSpanProcessor(exporter),
        resource,
        idGenerator: new AWSXRayIdGenerator(),
        instrumentations: [
          new HttpInstrumentation({
            ignoreIncomingPaths: _.union(defaultExcludePaths, excludePaths),
          }),
        ],
        textMapPropagator: new CompositePropagator({
          propagators: [
            new AWSXRayPropagator(),
            new JaegerPropagator(),
            new W3CTraceContextPropagator(),
            new W3CBaggagePropagator(),
            new B3Propagator(),
            new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
          ]
        }),
      });
      provider.start();
      return provider;*/
    } catch (_error) {
      console.error('Error creating OpenTelemetry provider: ', _error);
      return null;
    }
  },
  inject: [TRACING_MODULE_OPTIONS],
});
