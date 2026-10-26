import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Serializer } from '@nestjs/microservices';
import { CompressionTypes, Kafka, logLevel, Partitioners, Producer } from 'kafkajs';

import { KAFKA_MODULE_OPTIONS } from '../constants/kafka.constants.js';
import type {
  KafkaMessage,
  KafkaModuleOptions,
  KafkaRequest,
} from '../interfaces/kafka.interface.js';
import { KafkaRequestSerializer } from '../serializer/kafka-request.serializer.js';

/**
 * Servicio para producir mensajes a Kafka.
 * Este servicio permite enviar mensajes individuales o en lotes a uno o más tópicos de Kafka.
 * La conexión se abre de forma perezosa en el primer envío, se reutiliza en los siguientes y se cierra
 * al destruir el módulo (`onModuleDestroy`).
 *
 * @example
 * ```typescript
 * const singleMessage: KafkaMessage = {
 *   key: 'key1',
 *   value: { id: 1, content: 'Hello Kafka' },
 *   headers: { 'header-key': 'header-value' },
 * };
 * await producerService.sendMessages('my-topic', singleMessage);
 *
 * const batchMessages: KafkaMessage[] = [
 *   { key: 'key2', value: 'Message 1' },
 *   { key: 'key3', value: 'Message 2', headers: { 'header1': 'value1' } },
 * ];
 * await producerService.sendMessages('my-topic', batchMessages);
 *
 * const topicMessages = [
 *   { topic: 'topic1', messages: batchMessages },
 *   { topic: 'topic2', messages: [{ key: 'key4', value: 'Message to topic2' }] },
 * ];
 * await producerService.sendBatchMessages(topicMessages);
 * ```
 */
@Injectable()
export class ProducerService implements OnModuleDestroy {
  private readonly kafkaInstance: Kafka;
  private producer: Producer;
  /** Conexión en curso/establecida; se reutiliza entre envíos y se limpia al desconectar. */
  private connection: Promise<void> | null = null;
  private serializer: Serializer<any, KafkaRequest>;
  private readonly options: KafkaModuleOptions;

  /**
   * Constructor del ProducerService.
   * Inicializa el servicio con configuraciones específicas para la conexión a Kafka.
   * Lanza un error si no se proporcionan las configuraciones necesarias.
   *
   * @param {KafkaModuleOptions} kafkaOptions - Opciones de configuración para Kafka.
   */
  constructor(@Inject(KAFKA_MODULE_OPTIONS) private readonly kafkaOptions: KafkaModuleOptions) {
    /* istanbul ignore next */
    if (!this.kafkaOptions) {
      throw new Error('Kafka configuration is missing.');
    }
    const { client, producer: producerConfig } = this.kafkaOptions;
    this.options = this.kafkaOptions;

    this.kafkaInstance = new Kafka({
      logLevel: logLevel.NOTHING,
      ...client,
    });

    this.producer = this.kafkaInstance.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      ...producerConfig,
    });

    this.producer.on(this.producer.events.DISCONNECT, () => {
      this.connection = null;
    });

    this.initializeSerializer(this.options);
  }

  /**
   * Conecta el producer si todavía no lo está. Es idempotente y seguro ante llamadas concurrentes:
   * la conexión se establece una sola vez y se reutiliza en los envíos siguientes.
   */
  async connect(): Promise<void> {
    this.connection ??= this.producer.connect().catch((error: unknown) => {
      this.connection = null;
      throw error;
    });
    await this.connection;
  }

  /**
   * Desconecta el producer si estaba conectado.
   */
  async disconnect(): Promise<void> {
    if (!this.connection) return;
    this.connection = null;
    await this.producer.disconnect();
  }

  /**
   * Cierra la conexión del producer al destruir el módulo.
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Inicializa el serializador de solicitudes Kafka.
   * Utiliza un serializador predeterminado o uno proporcionado en las configuraciones.
   *
   * @param {KafkaModuleOptions} options - Opciones de configuración de Kafka.
   */
  protected initializeSerializer(options: KafkaModuleOptions): void {
    // `KafkaModuleOptions.serializer` is intentionally loosely typed (Serializer<any, any>) so
    // consumers can plug in their own implementation; it's trusted to honor this service's
    // contract (KafkaMessageSend in, KafkaRequest out).
    this.serializer = (
      options.serializer ? options.serializer : new KafkaRequestSerializer()
    ) as Serializer<any, KafkaRequest>;
  }

  /**
   * Envía mensajes a un tópico de Kafka.
   * Puede enviar un solo mensaje o un array de mensajes al mismo tópico.
   *
   * @example
   * ```typescript
   * const message: KafkaMessage = {
   *   key: 'user1',
   *   value: JSON.stringify({ id: 1, message: 'Hello, Kafka!' }),
   * };
   *
   * // Enviar un solo mensaje
   * await producerService.sendMessages('users', message);
   *
   * // Enviar múltiples mensajes
   * const messages: KafkaMessage[] = [
   *   { key: 'user2', value: JSON.stringify({ id: 2, message: 'Hello again!' }) },
   *   { key: 'user3', value: JSON.stringify({ id: 3, message: 'And hello once more!' }) }
   * ];
   * await producerService.sendMessages('users', messages);
   * ```
   *
   * @param {string} topic - El tópico de Kafka al que se enviarán los mensajes.
   * @param {KafkaMessage|KafkaMessage[]} messages - Un solo mensaje o un array de mensajes para enviar.
   * @param {number} acks - Nivel de reconocimiento para el envío de mensajes.
   * @param {number} timeout - Tiempo máximo en milisegundos antes de considerar fallida la operación de envío.
   * @param {CompressionTypes} compression - Tipo de compresión para el mensaje.
   */
  async sendMessages(
    topic: string,
    messages: KafkaMessage | KafkaMessage[],
    acks: number = -1,
    timeout: number = 30000,
    compression: CompressionTypes = CompressionTypes.GZIP,
  ): Promise<void> {
    try {
      await this.connect();
      const messagesArr: KafkaMessage[] = Array.isArray(messages) ? messages : [messages];

      const formattedMessages = await Promise.all(
        messagesArr.map(async (message: KafkaMessage) =>
          this.serializer.serialize({ topic, messages: message }),
        ),
      );

      await this.producer.send({
        topic,
        messages: formattedMessages,
        acks,
        timeout,
        compression,
      });
    } catch (error) {
      throw new Error(
        `Error sending message(s) to topic ${topic}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * Envía un lote de mensajes a uno o más tópicos de Kafka.
   *
   * @example
   * ```typescript
   * const topicMessages = [
   *   {
   *     topic: 'topic1',
   *     messages: [
   *       { key: 'key1', value: JSON.stringify({ content: 'Message 1' }) },
   *       { key: 'key2', value: JSON.stringify({ content: 'Message 2' }) }
   *     ]
   *   },
   *   {
   *     topic: 'topic2',
   *     messages: [
   *       { key: 'key3', value: JSON.stringify({ content: 'Message 3' }) }
   *     ]
   *   }
   * ];
   *
   * // Enviar mensajes a múltiples tópicos
   * await producerService.sendBatchMessages(topicMessages);
   * ```
   *
   * @param {{topic: string; messages: KafkaMessage[]}[]} topicMessages - Array de objetos que contienen el tópico y los mensajes a enviar.
   * @param {number} acks - Nivel de reconocimiento para el envío de mensajes.
   * @param {number} timeout - Tiempo máximo en milisegundos antes de considerar fallida la operación de envío.
   * @param {CompressionTypes} compression - Tipo de compresión para el mensaje.
   */
  async sendBatchMessages(
    topicMessages: { topic: string; messages: KafkaMessage[] }[],
    acks: number = -1,
    timeout: number = 30000,
    compression: CompressionTypes = CompressionTypes.GZIP,
  ): Promise<void> {
    try {
      await this.connect();

      // A custom serializer (e.g. Avro) may be async: resolve every message before sending.
      const formattedTopicMessages = await Promise.all(
        topicMessages.map(async (topicMessage) => ({
          topic: topicMessage.topic,
          messages: await Promise.all(
            topicMessage.messages.map(async (message) =>
              this.serializer.serialize({ topic: topicMessage.topic, messages: message }),
            ),
          ),
        })),
      );

      await this.producer.sendBatch({
        topicMessages: formattedTopicMessages,
        acks,
        timeout,
        compression,
      });
    } catch (error) {
      throw new Error(
        `Error sending batch messages: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }
}
