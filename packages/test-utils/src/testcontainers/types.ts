import { PortWithOptionalBinding } from 'testcontainers/build/utils/port';

export declare type Env = {
  [key in string]: any;
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
