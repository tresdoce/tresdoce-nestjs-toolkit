import { PortWithOptionalBinding } from 'testcontainers/dist/port';
import { Env } from 'testcontainers/dist/docker/types';

export interface ITestContainerOptions {
  ports?: PortWithOptionalBinding;
  envs?: Env;
  containerName?: string;
  startupTimeout?: number;
  reuse?: boolean;
}
