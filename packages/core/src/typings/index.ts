import { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';
import { TracingOptions } from '@tresdoce-nestjs-toolkit/tracing';
import { DatabaseOptions } from '@tresdoce-nestjs-toolkit/typeorm';
import { CamundaOptions } from '@tresdoce-nestjs-toolkit/camunda';
import { ElasticsearchOptions } from '@tresdoce-nestjs-toolkit/elk';
import { RedactOptions } from '@tresdoce-nestjs-toolkit/utils';
import { DiskHealthIndicatorOptions } from '@nestjs/terminus';
import { AxiosRequestConfig } from 'axios';

export type TAppStage = 'local' | 'test' | 'snd' | 'dev' | 'qa' | 'homo' | 'prod';

export type TSkipHealthChecks =
  | 'storage'
  | 'memory'
  | 'elasticsearch'
  | 'camunda'
  | 'typeorm'
  | 'redis';

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

export interface IServicesConfig extends AxiosRequestConfig {
  healthPath?: string;
  [key: string]: any;
}

export interface AppConfig {
  project: IProjectConfig;
  server: IServerConfig;
  health?: IHealthConfig;
  swagger: ISwaggerConfig;
  params?: IParamsConfig;
  services?: Record<string, IServicesConfig>;
  database?: DatabaseOptions;
  redis?: RedisOptions;
  mailer?: MailerOptions;
  camunda?: CamundaOptions;
  elasticsearch?: ElasticsearchOptions;
  tracing?: TracingOptions;
  redact?: RedactOptions;
  [key: string]: any;
}
