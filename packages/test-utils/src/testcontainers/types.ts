import { PortWithOptionalBinding } from 'testcontainers/dist/port';

export declare type EnvKey = string;
export declare type Env = {
  [key in EnvKey]: any;
};

export interface ITestContainerOptions {
  ports?: PortWithOptionalBinding[];
  envs?: Env;
  networkName?: string;
  containerName?: string;
  startupTimeout?: number;
  command?: string[];
  strategyHealthCheck?: boolean;
  reuse?: boolean;
}
