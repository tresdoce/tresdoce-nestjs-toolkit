import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';
import { ClientConfig } from 'camunda-external-task-client-js';
import { ClientOptions } from '@elastic/elasticsearch';
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

export interface IDatabaseConfiguration {
  typeorm?: TypeOrmModuleOptions;
}

export interface AppConfig {
  project: IProjectConfig;
  server: IServerConfig;
  swagger: ISwaggerConfig;
  params?: IParamsConfig;
  services?: Record<string, IServicesConfig>;
  database?: IDatabaseConfiguration;
  redis?: RedisOptions;
  mailer?: MailerOptions;
  camunda?: ClientConfig;
  elasticsearch?: ClientOptions;
  [key: string]: any;
}
