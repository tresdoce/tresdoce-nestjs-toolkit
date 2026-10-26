import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { KAFKA_MODULE_OPTIONS } from './constants/kafka.constants.js';
import type { KafkaModuleOptions } from './interfaces/kafka.interface.js';
import { ProducerService } from './services/producer.service.js';
import { ConsumerService } from './services/consumer.service.js';

/**
 * Este módulo proporciona la configuración y los servicios necesarios para interactuar con Kafka.
 * Está marcado como global, lo que significa que una vez importado en un módulo raíz, será accesible en cualquier parte de la aplicación.
 *
 * @module KafkaModule
 * @global
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ProducerService,
    ConsumerService,
    {
      /**
       * Proporciona una configuración dinámica para Kafka obtenida a través del servicio de configuración.
       * Esto permite personalizar los parámetros de Kafka desde un archivo de configuración o variables de entorno.
       *
       * @param configService - El servicio de configuración de NestJS, utilizado para acceder a las variables de configuración.
       * @returns {Promise<KafkaModuleOptions>} - Las opciones de configuración de Kafka.
       */
      provide: KAFKA_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<KafkaModuleOptions> =>
        configService.get<KafkaModuleOptions>('config.kafka'),
      inject: [ConfigService],
    },
  ],
  exports: [KAFKA_MODULE_OPTIONS, ProducerService, ConsumerService],
})
export class KafkaModule {}
