import { GenericContainer, StartedTestContainer, TestContainer } from 'testcontainers';
import * as _ from 'lodash';
import { RandomUuid } from 'testcontainers/dist/uuid';
import { StopOptions } from 'testcontainers/dist/test-container';
import { ContainerName, Env, Host } from 'testcontainers/dist/docker/types';
import { ITestContainerOptions } from './types';

export default class testContainers {
  private static _instance?: testContainers;
  private _container;

  /* istanbul ignore next */
  constructor(private _image: string = 'postgres:13', private _options?: ITestContainerOptions) {
    if (testContainers._instance)
      throw new Error('Use testContainers.getInstance() instead of new.');
    testContainers._instance = this;
  }

  /**
   * Get instance
   */
  /* istanbul ignore next */
  public static getInstance(_image?: string, _options?: ITestContainerOptions): testContainers {
    return (
      testContainers._instance ?? (testContainers._instance = new testContainers(_image, _options))
    );
  }

  private prepareContainer(options: ITestContainerOptions): TestContainer {
    const genericContainer = new GenericContainer(`${this._image}`);

    /* Add container name*/
    /* istanbul ignore next */
    if (_.has(options, 'containerName') && !_.isEmpty(options.containerName)) {
      genericContainer.withName(options.containerName);
    } else {
      /* istanbul ignore next */
      genericContainer.withName(`test-container-${new RandomUuid().nextUuid()}`);
    }

    /* Add container ports */
    if (_.has(options, 'ports') && !_.isEmpty(options.ports)) {
      genericContainer.withExposedPorts(this._options.ports);
    }

    /* Add container envs */
    if (_.has(options, 'envs') && !_.isEmpty(options.envs)) {
      Object.keys(options.envs).map((key) => {
        genericContainer.withEnv(`${key}`, `${options.envs[key]}`);
      });
    }

    /* Add startup timeout container */
    /* istanbul ignore next */
    if (_.has(options, 'startupTimeout')) {
      genericContainer.withStartupTimeout(options.startupTimeout);
    }

    /* Add container reuse*/
    if (_.has(options, 'reuse') && options.reuse) {
      genericContainer.withReuse();
    }

    return genericContainer;
  }

  /**
   * Started container
   */
  public async start(): Promise<void> {
    try {
      this._container = await this.prepareContainer(this._options).start();
      console.info('Container initialized');
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
      /* istanbul ignore next */
      console.error('Container not initialized');
    }
  }

  /*=============================*/

  /**
   * Get envs
   */
  /* istanbul ignore next */
  public getEnvs(): Env {
    return _.has(this._options, 'envs') ? this._options.envs : null;
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
