import path from 'node:path';
import { closeDockerCompose, initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

// Integration tests need a real broker and schema registry from the root docker-compose.yml.
export const setup = initDockerCompose(
  ['kafka', 'schema-registry'],
  path.resolve(import.meta.dirname, '..', '..'),
  'docker-compose.yml',
  360_000,
  {
    healthCheckWaitStrategyNames: [
      'tresdoce-test-utils-global-kafka',
      'tresdoce-test-utils-global-kafka-schema-registry',
    ],
  },
);

export const teardown = closeDockerCompose({ removeVolumes: true });
