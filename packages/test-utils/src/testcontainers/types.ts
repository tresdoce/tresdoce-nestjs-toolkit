import { PortWithOptionalBinding } from 'testcontainers/dist/port';
import { Env } from 'testcontainers/dist/docker/types';

export interface ITestContainerOptions {
  ports?: PortWithOptionalBinding;
  envs?: Env;
  containerName?: string;
  startupTimeout?: number;
  command?: string[];
  strategyHealthCheck?: boolean;
  reuse?: boolean;
}
