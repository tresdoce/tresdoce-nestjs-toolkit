import { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';
import { TracingOptions } from '@tresdoce-nestjs-toolkit/tracing';
import { DatabaseOptions } from '@tresdoce-nestjs-toolkit/typeorm';
import { CamundaOptions } from '@tresdoce-nestjs-toolkit/camunda';
import { ElasticsearchOptions } from '@tresdoce-nestjs-toolkit/elk';
import { AxiosRequestConfig } from 'axios';

export type TAppStage = 'local' | 'test' | 'snd' | 'dev' | 'qa' | 'homo' | 'prod';

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
  allowedHeaders: string;
  allowedMethods: string;
  corsEnabled: boolean;
  corsCredentials: boolean;
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
  swagger: ISwaggerConfig;
  params?: IParamsConfig;
  services?: Record<string, IServicesConfig>;
  database?: DatabaseOptions;
  redis?: RedisOptions;
  mailer?: MailerOptions;
  camunda?: CamundaOptions;
  elasticsearch?: ElasticsearchOptions;
  tracing?: TracingOptions;
  [key: string]: any;
}
