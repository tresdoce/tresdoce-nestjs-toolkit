import type { PortWithOptionalBinding, StartedDockerComposeEnvironment } from 'testcontainers';

declare global {
  var __TESTCONTAINERS__: StartedDockerComposeEnvironment | undefined;
  /** Host of the last container started with `testContainers#start()`. */
  var hostContainer: string | undefined;
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
