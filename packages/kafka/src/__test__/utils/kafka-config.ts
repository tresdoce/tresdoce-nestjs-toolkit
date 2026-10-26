import { KafkaModuleOptions } from '../../kafka/interfaces/kafka.interface.js';

const dockerTestHost = process.env.DOCKER_TEST_HOST || 'docker';

export const kafkaTestBaseConfig: KafkaModuleOptions = {
  client: {
    clientId: 'nestjs-test',
    brokers: [`${dockerTestHost}:9092`],
    retry: {
      initialRetryTime: 1000,
      retries: 10,
    },
    connectionTimeout: 3000,
    requestTimeout: 25000,
  },
  consumer: {
    groupId: 'nestjs-test-consumer',
  },
};
