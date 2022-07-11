import { AxiosRequestConfig } from 'axios';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from '@tresdoce-nestjs-toolkit/redis';
import { MailerOptions } from '@tresdoce-nestjs-toolkit/mailer';

type TApiPrefix = string;
type TName = string;
type TUrl = string;

export interface IProjectConfigAuthor {
  name: TName;
  email: string;
  url: TUrl;
  [key: string]: any;
}

export interface IProjectConfigRepository {
  type: string;
  url: TUrl;
  [key: string]: any;
}

export interface IProjectConfigBugs {
  url: TUrl;
  [key: string]: any;
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
  context: string;
  origins: string[] | string;
  allowedHeaders: string;
  allowedMethods: string;
  corsEnabled: boolean;
  corsCredentials: boolean;
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
  [key: string]: any;
}
