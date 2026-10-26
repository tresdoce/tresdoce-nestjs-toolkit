import type { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import type { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';
import type { TracingOptions } from '@tresdoce-nestjs-toolkit/tracing';
import type { DatabaseOptions } from '@tresdoce-nestjs-toolkit/typeorm';
import type { CamundaOptions } from '@tresdoce-nestjs-toolkit/camunda';
import type { ElasticsearchOptions } from '@tresdoce-nestjs-toolkit/elk';
import type { HttpModuleOptions } from '@tresdoce-nestjs-toolkit/http-client';
import type { RedactOptions, BcryptOptions } from '@tresdoce-nestjs-toolkit/utils';
import type { SnowFlakeOptions } from '@tresdoce-nestjs-toolkit/snowflake-uid';
import type { AwsSqsModuleOptions } from '@tresdoce-nestjs-toolkit/aws-sqs';
import type { LoggerModuleOptions } from '@tresdoce-nestjs-toolkit/logger';
import type { MongoModuleOptions } from '@tresdoce-nestjs-toolkit/database';
import type { KafkaModuleOptions } from '@tresdoce-nestjs-toolkit/kafka';
import type { ThrottlerModuleOptions } from '@tresdoce-nestjs-toolkit/rate-limit';
import type { DiskHealthIndicatorOptions } from '@nestjs/terminus';
import type { AxiosRequestConfig } from 'axios';
import type { CsrfCookieOptions } from '../commons/index.js';

export type TAppStage = 'local' | 'test' | 'snd' | 'dev' | 'qa' | 'homo' | 'prod';

export type TSkipHealthChecks =
  'storage' | 'memory' | 'elasticsearch' | 'camunda' | 'typeorm' | 'redis';

export enum EAppStage {
  local = 'local',
  test = 'test',
  snd = 'snd',
  dev = 'dev',
  qa = 'qa',
  homo = 'homo',
  prod = 'prod',
}

export enum ESkipHealthChecks {
  storage = 'storage',
  memory = 'memory',
  elasticsearch = 'elasticsearch',
  camunda = 'camunda',
  typeorm = 'typeorm',
  redis = 'redis',
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_STAGE: TAppStage;
    }
  }
}

export interface IProjectConfigAuthor {
  name: string;
  email: string;
  url: string;
}

export interface IProjectConfigRepository {
  type: string;
  url: string;
}

export interface IProjectConfigBugs {
  url: string;
}

export interface IHealthMemory {
  heap: number;
  rss: number;
}

export interface IProjectConfig {
  apiPrefix: string;
  name: string;
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
  appStage: TAppStage;
  port: number;
  context: string;
  origins: string[] | string;
  propagateHeaders?: string[];
  exposedHeaders?: string;
  allowedHeaders: string;
  allowedMethods: string;
  corsEnabled: boolean;
  corsCredentials: boolean;
  csrf?: CsrfCookieOptions;
  rateLimits?: ThrottlerModuleOptions;
}

export interface IHealthConfig {
  skipChecks?: TSkipHealthChecks[];
  storage?: DiskHealthIndicatorOptions;
  memory?: IHealthMemory;
}

export interface ISwaggerConfig {
  path: string;
  enabled: boolean;
}

export interface IParamsConfig {
  [key: string]: any;
}

export interface IHttpClientConfig {
  httpOptions?: HttpModuleOptions;
  propagateHeaders?: string[];
}

export interface IServicesConfig extends AxiosRequestConfig {
  healthPath?: string;
  [key: string]: any;
}

/** `database.typeorm` lo lee `@tresdoce-nestjs-toolkit/typeorm`; `database.mongo`, `@tresdoce-nestjs-toolkit/database`. */
export interface DatabaseModuleOptions extends DatabaseOptions {
  mongo?: MongoModuleOptions;
}

export interface AppConfig {
  project: IProjectConfig;
  server: IServerConfig;
  health?: IHealthConfig;
  swagger: ISwaggerConfig;
  params?: IParamsConfig;
  httpClient?: IHttpClientConfig;
  services?: Record<string, IServicesConfig>;
  database?: DatabaseModuleOptions;
  redis?: RedisOptions;
  mailer?: MailerOptions;
  camunda?: CamundaOptions;
  elasticsearch?: ElasticsearchOptions;
  tracing?: TracingOptions;
  redact?: RedactOptions;
  bcrypt?: BcryptOptions;
  snowflakeUID?: SnowFlakeOptions;
  sqs?: AwsSqsModuleOptions;
  logger?: LoggerModuleOptions;
  kafka?: KafkaModuleOptions;
  [key: string]: any;
}
