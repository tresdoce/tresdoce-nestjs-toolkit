import { AxiosRequestConfig } from 'axios';

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
  [key: string]: any;
}

export interface AppConfig {
  project: IProjectConfig;
  server: IServerConfig;
  swagger: ISwaggerConfig;
  params: IParamsConfig;
  services: Record<string, IServicesConfig>;
  [key: string]: any;
}
