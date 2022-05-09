import { GenericContainer, StartedTestContainer, TestContainer } from 'testcontainers';
import { ContainerName, Host } from 'testcontainers/dist/docker/types';
import { StopOptions } from 'testcontainers/dist/test-container';
import { PortWithOptionalBinding } from 'testcontainers/dist/port';

export default class testContainers {
  private static _instance?: testContainers;
  private container;

  constructor(
    private image: string = 'postgres:13',
    private username: string = 'root',
    private password: string = '123456',
    private database: string = 'test_db',
    private ports: PortWithOptionalBinding = {
      container: 5432,
      host: 5432,
    },
  ) {
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
    return new GenericContainer(this.image)
      .withName(`tresdoce-test-container-postgres`)
      .withEnv('POSTGRES_USER', this.username)
      .withEnv('POSTGRES_PASSWORD', this.password)
      .withEnv('POSTGRES_DB', this.database)
      .withExposedPorts(this.ports)
      .withStartupTimeout(1000000)
      .withReuse();
  }

  /**
   * Started container
   */
  public async start(): Promise<void> {
    try {
      this.container = await this.prepareContainer().start();
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
      await this.container.stop(options);
      console.info('Container stopped successfully');
    } catch (e) {
      console.error('Container not initialized');
    }
  }

  /*=============================*/

  /**
   * Get username
   */
  public getUsername(): string {
    return this.username;
  }

  /**
   * Get password
   */
  public getPassword(): string {
    return this.password;
  }

  /**
   * Get database name
   */
  public getDatabase(): string {
    return this.database;
  }

  /**
   * Get container
   */
  public getContainer(): StartedTestContainer {
    return this.container;
  }

  /**
   * Get host of container
   */
  public getHost(): Host {
    return this.container.getHost();
  }

  /**
   * Get container name
   */
  public getName(): ContainerName {
    return this.container.getName();
  }
}
