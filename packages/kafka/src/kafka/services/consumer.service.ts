import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Deserializer } from '@nestjs/microservices';
import {
  Admin,
  Consumer,
  Kafka,
  logLevel,
  SeekEntry,
  KafkaMessage as KafkaJsMessage,
} from 'kafkajs';

import { KafkaResponseDeserializer } from '../deserializer/kafka-response.deserializer.js';
import type { KafkaModuleOptions, KafkaResponse } from '../interfaces/kafka.interface.js';
import { KAFKA_MODULE_OPTIONS } from '../constants/kafka.constants.js';
import {
  SUBSCRIBER_CLASS_MAP,
  SUBSCRIBER_MAP,
  SUBSCRIBER_OBJECT_MAP,
} from '../decorators/kafka.decorator.js';

/**
 * Servicio que gestiona la consumición de mensajes desde Kafka.
 * Implementa métodos para conectar y desconectar consumidores, suscribirse a tópicos y procesar mensajes entrantes.
 * Además, maneja la deserialización de mensajes entrantes utilizando un deserializador configurable.
 *
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private static readonly TOPIC_OFFSETS_RETRY_ATTEMPTS = 5;
  private static readonly TOPIC_OFFSETS_RETRY_DELAY_MS = 500;
  private static readonly SEEK_RETRY_ATTEMPTS = 5;
  private static readonly SEEK_RETRY_DELAY_MS = 500;
  private static readonly GROUP_JOIN_TIMEOUT_MS = 5000;
  private readonly kafkaInstance: Kafka;
  private readonly admin: Admin;
  private readonly consumer: Consumer;
  private consumerConnected = false;
  private adminConnected = false;
  private consumerRunning = false;
  private consumerRunPromise: Promise<void> | null = null;
  private readonly logger = new Logger(ConsumerService.name);
  private deserializer: Deserializer<KafkaJsMessage, KafkaResponse<unknown>>;
  private readonly options: KafkaModuleOptions;

  protected topicOffsets: Map<string, (SeekEntry & { high: string; low: string })[]> = new Map();

  private debugLog(message: string): void {
    if (process.env.KAFKA_TEST_DEBUG === 'true') {
      console.log(`[kafka-consumer] ${message}`);
    }
  }

  /**
   * Constructor del servicio de consumidor. Configura y crea las instancias necesarias para la conexión con Kafka.
   *
   * @param {KafkaModuleOptions} kafkaOptions - Opciones de configuración de Kafka inyectadas.
   */
  constructor(
    @Inject(KAFKA_MODULE_OPTIONS) private readonly kafkaOptions: KafkaModuleOptions,
    @Optional() private readonly moduleRef?: ModuleRef,
  ) {
    /* istanbul ignore next */
    if (!this.kafkaOptions) {
      throw new Error('Kafka configuration is missing.');
    }

    const { client, consumer: consumerConfig } = this.kafkaOptions;
    this.options = this.kafkaOptions;

    this.kafkaInstance = new Kafka({
      logLevel: logLevel.NOTHING,
      ...client,
    });

    // `consumer` es opcional para apps que solo producen: sin `groupId` no se crea el consumer y
    // `connect()` falla con un error claro si aun así hay handlers `@SubscribeTo` registrados.
    if (consumerConfig?.groupId) {
      this.consumer = this.kafkaInstance.consumer(consumerConfig);
    }
    this.admin = this.kafkaInstance.admin();

    this.initializeDeserializer(this.options);
  }

  /**
   * Inicia la conexión del consumidor y admin, suscribe a todos los tópicos necesarios y comienza a procesar mensajes.
   */
  async onModuleInit(): Promise<void> {
    if (SUBSCRIBER_MAP.size === 0) {
      this.debugLog('onModuleInit:skipped:noSubscribers');
      return;
    }

    this.debugLog('onModuleInit:start');
    this.resolveSubscriberInstances();
    await this.connect();
    this.debugLog('onModuleInit:connected');
    await this.getTopicOffsets();
    this.debugLog('onModuleInit:topicOffsetsLoaded');
    await this.subscribeToAllTopics();
    this.debugLog('onModuleInit:subscribed');
    await this.bindAllTopicToConsumer();
    this.debugLog('onModuleInit:consumerBound');
  }

  /**
   * Resuelve la instancia de cada clase que declaró un `@SubscribeTo`, para que el handler
   * corra con `this` apuntando al provider (y pueda usar sus dependencias inyectadas).
   * Las instancias ya registradas manualmente en `SUBSCRIBER_OBJECT_MAP` se respetan.
   */
  private resolveSubscriberInstances(): void {
    if (!this.moduleRef) return;
    for (const [topic, subscriberClass] of SUBSCRIBER_CLASS_MAP) {
      if (SUBSCRIBER_OBJECT_MAP.has(topic)) continue;
      try {
        const instance = this.moduleRef.get(subscriberClass, { strict: false });
        if (instance) SUBSCRIBER_OBJECT_MAP.set(topic, instance as object);
      } catch {
        this.debugLog(`resolveSubscriberInstances:notFound:${topic}:${subscriberClass.name}`);
      }
    }
  }

  /**
   * Limpia y desconecta el consumidor y admin al destruir el módulo.
   */
  async onModuleDestroy(): Promise<void> {
    this.debugLog('onModuleDestroy:start');
    await this.disconnect();
    this.debugLog('onModuleDestroy:done');
  }

  /**
   * Establece conexiones con Kafka para el consumidor y el admin, y maneja eventos de conexión y desconexión.
   */
  async connect(): Promise<void> {
    this.debugLog('connect:start');
    if (!this.consumer) {
      throw new Error('Kafka consumer configuration is missing (config.kafka.consumer.groupId).');
    }

    if (!this.consumerConnected) {
      await this.consumer.connect();
      this.consumerConnected = true;
      this.debugLog('connect:consumerConnected');
    }

    if (!this.adminConnected) {
      await this.admin.connect();
      this.adminConnected = true;
      this.debugLog('connect:adminConnected');
    }
  }

  /**
   * Desconecta el consumidor y el admin de Kafka.
   */
  async disconnect(): Promise<void> {
    this.debugLog('disconnect:start');
    if (this.consumerRunning) {
      this.debugLog('disconnect:stoppingConsumer');
      await this.consumer.stop();
      this.consumerRunning = false;
      await this.consumerRunPromise?.catch(() => undefined);
      this.consumerRunPromise = null;
      this.debugLog('disconnect:consumerStopped');
    }

    if (this.consumerConnected) {
      await this.consumer.disconnect();
      this.consumerConnected = false;
      this.debugLog('disconnect:consumerDisconnected');
    }

    if (this.adminConnected) {
      await this.admin.disconnect();
      this.adminConnected = false;
      this.debugLog('disconnect:adminDisconnected');
    }
  }

  /**
   * Verifica si el consumidor está actualmente conectado.
   *
   * @returns {boolean} Verdadero si el consumidor está conectado.
   */
  isConsumerConnected(): boolean {
    return this.consumerConnected;
  }

  /**
   * Inicializa el deserializador para los mensajes entrantes, utilizando el deserializador por defecto o uno personalizado.
   *
   * @param {KafkaModuleOptions} options - Opciones de configuración de Kafka.
   */
  protected initializeDeserializer(options: KafkaModuleOptions): void {
    // `KafkaModuleOptions.deserializer` is intentionally loosely typed (Deserializer<any, any>)
    // so consumers can plug in their own implementation; it's trusted to honor this service's
    // contract (KafkaJS raw message in, KafkaResponse out).
    this.deserializer = (options.deserializer ?? new KafkaResponseDeserializer()) as Deserializer<
      KafkaJsMessage,
      KafkaResponse<unknown>
    >;
  }

  /**
   * Suscribe el consumidor, en una sola llamada, a todos los tópicos registrados con `@SubscribeTo`.
   */
  private async subscribeToAllTopics(): Promise<void> {
    const topics = [...SUBSCRIBER_MAP.keys()];
    this.debugLog(`subscribe:start:${topics.join(',')}`);
    await this.consumer.subscribe({
      topics,
      fromBeginning: this.options?.subscribe?.fromBeginning || false,
    });
    this.debugLog(`subscribe:done:${topics.join(',')}`);
  }

  /**
   * Recupera y almacena, en paralelo, los offsets de los tópicos a los que el consumidor está suscrito.
   */
  private async getTopicOffsets(): Promise<void> {
    await Promise.all(
      [...SUBSCRIBER_MAP.keys()].map(async (topic) => {
        try {
          this.debugLog(`getTopicOffsets:start:${topic}`);
          const topicOffsets = await this.fetchTopicOffsetsWithRetry(topic);
          this.topicOffsets.set(topic, topicOffsets);
          this.debugLog(`getTopicOffsets:done:${topic}`);
        } catch (error) {
          /* istanbul ignore next */
          throw new Error(
            `Error fetching topic offset ${topic}: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
          );
        }
      }),
    );
  }

  /**
   * Ejecuta `fn` y, si falla, la reintenta hasta `attempts` veces esperando `delayMs` entre intentos.
   * Si todos los intentos fallan, lanza el último error.
   */
  private async withRetry<T>(
    fn: (attempt: number) => Promise<T> | T,
    attempts: number,
    delayMs: number,
    onError: (error: Error, attempt: number) => void,
    attempt = 1,
  ): Promise<T> {
    try {
      return await fn(attempt);
    } catch (error) {
      onError(error as Error, attempt);
      if (attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.withRetry(fn, attempts, delayMs, onError, attempt + 1);
    }
  }

  /**
   * Reintenta la obtención de offsets para tolerar el arranque del broker y la propagación inicial de metadata.
   *
   * @param {string} topic - Tópico del que se desean consultar offsets.
   * @returns {Promise<(SeekEntry & { high: string; low: string })[]>} Offsets del tópico.
   */
  private fetchTopicOffsetsWithRetry(
    topic: string,
  ): Promise<(SeekEntry & { high: string; low: string })[]> {
    return this.withRetry(
      (attempt) => {
        this.debugLog(`fetchTopicOffsets:attempt:${topic}:${attempt}`);
        return this.admin.fetchTopicOffsets(topic);
      },
      ConsumerService.TOPIC_OFFSETS_RETRY_ATTEMPTS,
      ConsumerService.TOPIC_OFFSETS_RETRY_DELAY_MS,
      (error, attempt) =>
        this.debugLog(`fetchTopicOffsets:error:${topic}:${attempt}:${error.message}`),
    );
  }

  /**
   * Asigna el manejador de mensajes a cada tópico suscrito y procesa cada mensaje entrante aplicando la función de callback respectiva.
   */
  async bindAllTopicToConsumer(): Promise<void> {
    this.debugLog('bindAllTopicToConsumer:start');
    const groupJoinPromise = this.waitForGroupJoin();
    this.consumerRunning = true;
    this.consumerRunPromise = this.consumer
      .run({
        ...this.options.run,
        eachMessage: async ({ topic, partition, message }): Promise<void> => {
          const callback = SUBSCRIBER_MAP.get(topic);
          const objectRef = SUBSCRIBER_OBJECT_MAP.get(topic);

          try {
            const { key, value, offset, timestamp, headers } = await this.deserializer.deserialize(
              message,
              { topic },
            );
            await callback.apply(objectRef, [
              { key, value, offset, timestamp, headers, partition },
            ]);
          } catch (error) {
            /* istanbul ignore next */
            throw new Error(
              `Error handling message for topic ${topic}: ${error instanceof Error ? error.message : String(error)}`,
              { cause: error },
            );
          }
        },
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Kafka consumer run failed: ${message}`);
        this.debugLog(`bindAllTopicToConsumer:runError:${message}`);
      })
      .finally(() => {
        this.consumerRunning = false;
        this.consumerRunPromise = null;
        this.debugLog('bindAllTopicToConsumer:runFinished');
      });
    this.debugLog('bindAllTopicToConsumer:runCalled');
    await groupJoinPromise;
    this.debugLog('bindAllTopicToConsumer:groupJoined');
    if (this.options?.seek) {
      this.debugLog('bindAllTopicToConsumer:seekTopics');
      await this.seekTopics();
    }
  }

  private async waitForGroupJoin(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        removeGroupJoinListener();
        reject(
          new Error(
            `Consumer group join timed out after ${ConsumerService.GROUP_JOIN_TIMEOUT_MS}ms`,
          ),
        );
      }, ConsumerService.GROUP_JOIN_TIMEOUT_MS);

      const removeGroupJoinListener = this.consumer.on('consumer.group_join', () => {
        clearTimeout(timeout);
        removeGroupJoinListener();
        resolve();
      });
    });
  }

  /**
   * Busca en los tópicos específicos para ajustar el punto de inicio de la lectura de mensajes según una configuración o timestamp.
   * Cada partición se ajusta por separado, así que todos los seeks corren en paralelo.
   */
  private async seekTopics(): Promise<void> {
    await Promise.all(Object.keys(this.options.seek).map((topic) => this.seekTopic(topic)));
  }

  private async seekTopic(topic: string): Promise<void> {
    const topicOffsets =
      this.topicOffsets.get(topic) || (await this.fetchTopicOffsetsWithRetry(topic));

    /* istanbul ignore next */
    if (!topicOffsets) return;

    const seekPoint = this.options.seek[topic];
    await Promise.all(
      topicOffsets.map((topicOffset) =>
        this.seekWithRetry(
          topic,
          topicOffset.partition,
          this.resolveSeekOffset(seekPoint, topicOffset),
        ),
      ),
    );
  }

  /** Offset para un seek: `earliest` es el offset más bajo; una fecha, su timestamp. */
  private resolveSeekOffset(
    seekPoint: number | 'earliest' | Date,
    topicOffset: SeekEntry & { low: string },
  ): string {
    if (seekPoint === 'earliest') return topicOffset.low;
    if (typeof seekPoint === 'object') return seekPoint.getTime().toString();
    return String(seekPoint);
  }

  private seekWithRetry(topic: string, partition: number, offset: string): Promise<void> {
    return this.withRetry(
      (attempt) => {
        this.debugLog(`seek:attempt:${topic}:${partition}:${attempt}:${offset}`);
        this.consumer.seek({ topic, partition, offset });
        this.debugLog(`seek:done:${topic}:${partition}:${offset}`);
      },
      ConsumerService.SEEK_RETRY_ATTEMPTS,
      ConsumerService.SEEK_RETRY_DELAY_MS,
      (error, attempt) =>
        this.debugLog(`seek:error:${topic}:${partition}:${attempt}:${error.message}`),
    );
  }
}
