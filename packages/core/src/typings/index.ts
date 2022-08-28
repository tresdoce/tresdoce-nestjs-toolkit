import { AxiosRequestConfig } from 'axios';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';
import { ClientConfig } from 'camunda-external-task-client-js';
import { ClientOptions } from '@elastic/elasticsearch';

type TApiPrefix = string;
type TName = string;
type TUrl = string;

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
}

export interface IServerConfig {
  isProd: boolean;
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
