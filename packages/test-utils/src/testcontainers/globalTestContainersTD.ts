import {
  DockerComposeEnvironment,
  type StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import type { ComposeDownOptions } from 'testcontainers/build/container-runtime/index.js';
import _ from 'lodash';

let environment: StartedDockerComposeEnvironment | undefined;

/**
 * Options for customizing how `initDockerCompose` waits for containers to become ready.
 */
export type InitDockerComposeOptions = {
  /**
   * Explicit container names that should use `Wait.forHealthCheck()` as wait strategy.
   * The values must be real container names, not docker-compose service names.
   */
  healthCheckWaitStrategyNames?: string[];

  /**
   * When `true`, applies `Wait.forHealthCheck()` as the default wait strategy
   * for every container started by the compose environment.
   */
  useDefaultHealthCheckWaitStrategy?: boolean;
};

/**
 * Creates a Vitest `globalSetup` compatible setup function that boots a docker-compose environment.
 *
 * @param _services - Optional subset of docker-compose services to start.
 * @param _composeFilePath - Directory where the compose file is located.
 * @param _composeFile - Compose file name.
 * @param _startupTimeout - Maximum startup time in milliseconds.
 * @param _options - Additional wait strategy configuration.
 * @returns An async function that starts the compose environment.
 */
export const initDockerCompose = (
  _services?: Array<string>,
  _composeFilePath = '.',
  _composeFile = 'docker-compose.yml',
  _startupTimeout = 60000,
  _options: InitDockerComposeOptions = {},
) => {
  return async (): Promise<StartedDockerComposeEnvironment | undefined> => {
    console.info(`🐳 Initialize docker-compose...`);
    if (_.isEmpty(_services)) {
      console.log(`• All services from ${_composeFile}`);
    } else {
      console.log(`• Services from ${_composeFile}: ${_services.join(', ')}`);
    }
    try {
      let composeEnvironment = new DockerComposeEnvironment(
        _composeFilePath,
        _composeFile,
      ).withStartupTimeout(_startupTimeout);

      if (_options.useDefaultHealthCheckWaitStrategy) {
        composeEnvironment = composeEnvironment.withDefaultWaitStrategy(Wait.forHealthCheck());
      }

      for (const containerName of _options.healthCheckWaitStrategyNames || []) {
        composeEnvironment = composeEnvironment.withWaitStrategy(
          containerName,
          Wait.forHealthCheck(),
        );
      }

      environment = await composeEnvironment.up(_services);
      globalThis.__TESTCONTAINERS__ = environment;
      console.info(`✨ Container(s) initialized.`);
      return environment;
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😰 Error initializing container(s): ${_error}`);
      return undefined;
    }
  };
};

/**
 * Creates a Vitest `globalSetup` compatible teardown function that stops the docker-compose environment.
 *
 * @param _options - Optional docker compose down options.
 * @returns An async function that tears down the compose environment.
 */
export const closeDockerCompose = (_options?: Partial<ComposeDownOptions>) => {
  return async (): Promise<void> => {
    console.info('🐳 Terminate docker-compose...');
    try {
      const startedEnvironment = environment ?? globalThis.__TESTCONTAINERS__;
      await startedEnvironment.down(_options);
      environment = undefined;
      globalThis.__TESTCONTAINERS__ = undefined;
      console.info(`👌 Container(s) stopped successfully.`);
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😒 Container(s) not initialized.`);
    }
  };
};
