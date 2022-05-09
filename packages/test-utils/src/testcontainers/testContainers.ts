import { GenericContainer, StartedTestContainer, TestContainer } from 'testcontainers';
import * as _ from 'lodash';

import { StopOptions } from 'testcontainers/dist/test-container';
import { ContainerName, Env, Host } from 'testcontainers/dist/docker/types';
import { ITestContainerOptions } from './types';

export default class testContainers {
  private static _instance?: testContainers;
  private _container;

  constructor(private _image: string = 'postgres:13', private _options?: ITestContainerOptions) {
    if (testContainers._instance)
      throw new Error('Use testContainers.getInstance() instead of new.');
    testContainers._instance = this;
  }

  /**
   * Get instance
   */
  public static getInstance(): testContainers {
    return testContainers._instance ?? (testContainers._instance = new testContainers());
  }

  private prepareContainer(): TestContainer {
    const genericContainer = new GenericContainer(`${this._image}`);

    /* Add container name*/
    if (_.has(this._options, 'containerName') && !_.isEmpty(this._options.containerName)) {
      genericContainer.withName(this._options.containerName);
    }

    /* Add container ports */
    if (_.has(this._options, 'ports') && !_.isEmpty(this._options.ports)) {
      genericContainer.withExposedPorts(this._options.ports);
    }

    /* Add container envs */
    if (_.has(this._options, 'envs') && !_.isEmpty(this._options.envs)) {
      Object.keys(this._options.envs).map((key) => {
        genericContainer.withEnv(`${key}`, `${this._options.envs[key]}`);
      });
    }

    /* Add startup timeout container */
    if (_.has(this._options, 'startupTimeout')) {
      genericContainer.withStartupTimeout(this._options.startupTimeout);
    }

    /* Add container reuse*/
    if (_.has(this._options, 'reuse') && this._options.reuse) {
      genericContainer.withReuse();
    }

    return genericContainer;
  }

  /**
   * Started container
   */
  public async start(): Promise<void> {
    try {
      this._container = await this.prepareContainer().start();
    } catch (e) {
      /* istanbul ignore next */
      console.error(`Error initializing container: ${e}`);
    }
  }

  /**
   * Stop container
   * @param options optional stop options of testcontainers.
   */
  public async stop(options?: Partial<StopOptions>): Promise<void> {
    try {
      await this._container.stop(options);
      console.info('Container stopped successfully');
    } catch (e) {
      console.error('Container not initialized');
    }
  }

  /*=============================*/

  /**
   * Get envs
   */
  public getEnvs(): Env {
    return _.has(this._options, 'envs') ? this._options.envs : {};
  }

  /**
   * Get container
   */
  public getContainer(): StartedTestContainer {
    return this._container;
  }

  /**
   * Get host of container
   */
  public getHost(): Host {
    return this._container.getHost();
  }

  /**
   * Get container name
   */
  public getName(): ContainerName {
    return this._container.getName();
  }
}
