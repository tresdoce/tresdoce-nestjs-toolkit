import { KafkaContainer } from '@testcontainers/kafka';
import { GenericContainer, Network, Wait } from 'testcontainers';
import type { TestProject } from 'vitest/node';

const KAFKA_IMAGE = 'confluentinc/cp-kafka:7.8.0';
const SCHEMA_REGISTRY_IMAGE = 'confluentinc/cp-schema-registry:7.8.0';
const KAFKA_HOST_PORT = 9093; // PLAINTEXT listener exposed to the host by KafkaContainer
const KAFKA_INTERNAL_BOOTSTRAP = 'PLAINTEXT://kafka:9092'; // BROKER listener, network alias "kafka"
const SCHEMA_REGISTRY_PORT = 8081;

/**
 * Starts Kafka (KRaft, no ZooKeeper) and Schema Registry on their own Docker network and hands the
 * real host addresses to the tests through `inject('kafkaBroker')` / `inject('schemaRegistryUrl')`.
 * Nothing depends on a "docker" hostname or on the root docker-compose.yml, so it runs the same
 * locally and on CI runners.
 */
export default async function setup(project: TestProject) {
  console.info('🐳 Starting Kafka (KRaft) and Schema Registry...');
  const network = await new Network().start();

  const kafka = await new KafkaContainer(KAFKA_IMAGE)
    .withKraft()
    .withNetwork(network)
    .withNetworkAliases('kafka')
    .start();

  const schemaRegistry = await new GenericContainer(SCHEMA_REGISTRY_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('schema-registry')
    .withExposedPorts(SCHEMA_REGISTRY_PORT)
    .withEnvironment({
      SCHEMA_REGISTRY_HOST_NAME: 'schema-registry',
      SCHEMA_REGISTRY_LISTENERS: `http://0.0.0.0:${SCHEMA_REGISTRY_PORT}`,
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: KAFKA_INTERNAL_BOOTSTRAP,
    })
    .withWaitStrategy(Wait.forHttp('/subjects', SCHEMA_REGISTRY_PORT).forStatusCode(200))
    .withStartupTimeout(180_000)
    .start();

  project.provide('kafkaBroker', `${kafka.getHost()}:${kafka.getMappedPort(KAFKA_HOST_PORT)}`);
  project.provide(
    'schemaRegistryUrl',
    `http://${schemaRegistry.getHost()}:${schemaRegistry.getMappedPort(SCHEMA_REGISTRY_PORT)}`,
  );
  console.info('✨ Kafka and Schema Registry ready.');

  return async () => {
    console.info('🐳 Stopping Kafka and Schema Registry...');
    await schemaRegistry.stop();
    await kafka.stop();
    await network.stop();
  };
}
