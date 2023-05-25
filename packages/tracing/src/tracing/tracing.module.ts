import { DynamicModule, Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

@Global()
@Module({})
export class OpenTelemetryModule {
  constructor(private configService: ConfigService) {}

  static register(): DynamicModule {
    const serviceProvider = {
      provide: 'OpenTelemetry',
      useFactory: (configService: ConfigService) => {
        try {
          const serviceName = configService.get<string>('SERVICE_NAME', 'my-service');
          const exporterType = configService.get<string>('EXPORTER_TYPE', 'jaeger'); // default to Jaeger

          const tracerProvider = new NodeTracerProvider({
            resource: new Resource({
              [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
              [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0'
            }),
          });

          registerInstrumentations({
            instrumentations: [
              new HttpInstrumentation(),
              // add more instrumentations here
            ],
            tracerProvider,
          });

          tracerProvider.register();

          // Depending on the exporter type, instantiate the appropriate exporter
          let exporter;
          if (exporterType.toLowerCase() === 'jaeger') {
            exporter = new JaegerExporter({
              serviceName,
            });
          } else {
            // For AWS XRay and any other OpenTelemetry collector
            const endpoint = configService.get<string>('EXPORTER_ENDPOINT', 'http://localhost:55681/v1/trace');
            exporter = new CollectorTraceExporter({
              serviceName,
              url: endpoint,
            });
          }

          tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));

          diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

          return tracerProvider;
        } catch (error) {
          Logger.error('Error creating OpenTelemetry provider', error);
          // Continues the application in case of error
          return null;
        }
      },
      inject: [ConfigService],
    };

    return {
      module: OpenTelemetryModule,
      providers: [serviceProvider],
      exports: ['OpenTelemetry'],
    };
  }
}
