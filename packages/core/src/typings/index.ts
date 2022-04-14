import { ResourceAttributes } from '@opentelemetry/resources';
import { IgnoreMatcher } from '@opentelemetry/instrumentation-http';
import { ExporterConfig as PrometheusExporterConfig } from '@opentelemetry/exporter-prometheus';
import { ExporterConfig as JaegerExporterConfig } from '@opentelemetry/exporter-jaeger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'rhea-promise';
import { AxiosRequestConfig } from 'axios';

type TApiPrefix = string;
type TName = string;
type TUrl = string;

export interface Tag {
  key: string;
  value: string | number | boolean;
}

export interface IOpenTelemetryConfiguration {
  serviceName: string;
  metricInterval?;
  resourceAttributes?: ResourceAttributes;
  prometheusExporterConfig?: PrometheusExporterConfig;
  jaegerExporterConfig?: JaegerExporterConfig;
  excludeTracerPaths?: IgnoreMatcher[];
  [key: string]: any;
}

export interface IMongoDatabaseConfig {
  connection: string;
  user: string;
  password: string;
  host: string;
  port: number;
  dbName: string;
  [key: string]: any;
}

export interface IArtemisConfiguration {
  connectionOptions?: ConnectionOptions;
  protocol?: string;
  username?: string;
  password?: string;
  port?: number;
  url?: string;
  name?: string;
  [key: string]: any;
}

export interface IHttpClientModuleConfiguration {
  httpOptions: AxiosRequestConfig;
  aditionalPropagateHeaders?: string;
}

export interface IProjectConfigAuthor {
  name: TName;
  email: string;
  url: TUrl;
}
export interface IProjectConfigRepository {
  type: string;
  url: TUrl;
}
export interface IProjectConfigBugs {
  url: TUrl;
}
export interface IProjectConfig {
  apiPrefix: TApiPrefix;
  name: TName;
  version: string;
  description: string;
  author: IProjectConfigAuthor;
  repository: IProjectConfigRepository;
  bugs: IProjectConfigBugs;
  homepage: string;
  [key: string]: any;
}

export interface IServerConfig {
  isProd: boolean;
  port: number;
  logLevel: string;
  context: string;
  origins: string[] | string;
  allowedHeaders: string;
  allowedMethods: string;
  corsEnabled: boolean;
  corsCredentials: boolean;
  [key: string]: any;
}

export interface IDatabaseConfiguration {
  mongo?: IMongoDatabaseConfig;
  typeorm?: TypeOrmModuleOptions;
  [key: string]: any;
}

export interface ISwaggerConfig {
  path: string;
  enabled: boolean;
  [key: string]: any;
}
export interface IParamsConfig {
  [key: string]: any;
}

export interface IServicesConfig extends AxiosRequestConfig {
  healthPath?: string;
  [key: string]: any;
}

export interface AppConfig {
  project: IProjectConfig;
  server: IServerConfig;
  swagger: ISwaggerConfig;
  jaeger: IOpenTelemetryConfiguration;
  params: IParamsConfig;
  httpConfig?: IHttpClientModuleConfiguration;
  artemisConfig?: IArtemisConfiguration;
  database?: IDatabaseConfiguration;
  services?: Record<string, IServicesConfig>;
  [key: string]: any;
}
