import { StartedDockerComposeEnvironment } from 'testcontainers';
import { PortWithOptionalBinding } from 'testcontainers/build/utils/port';

declare global {
  // eslint-disable-next-line no-var
  var __TESTCONTAINERS__: StartedDockerComposeEnvironment | undefined;
}

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
