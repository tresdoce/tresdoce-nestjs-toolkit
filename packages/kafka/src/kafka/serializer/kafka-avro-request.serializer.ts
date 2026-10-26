import { Serializer } from '@nestjs/microservices';
import { readAVSCAsync, SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import type { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api/index.js';
import type { SchemaRegistryAPIClientOptions } from '@kafkajs/confluent-schema-registry/dist/@types.js';

import type {
  KafkaMessage,
  KafkaMessageSend,
  KafkaRequest,
} from '../interfaces/kafka.interface.js';

type KafkaAvroRequestSerializerSchema = {
  topic: string;
  key?: string;
  value?: string;
  keySuffix?: string;
  valueSuffix?: string;
};

export type KafkaAvroRequestSerializerConfig = {
  schemas: KafkaAvroRequestSerializerSchema[];
  config: SchemaRegistryAPIClientArgs;
  options: SchemaRegistryAPIClientOptions;
  schemaSeparator?: string;
  schemaFetchIntervalSeconds?: number;
};

interface KafkaSchemaMap {
  keyId: number | null;
  valueId: number;
  keySuffix: string;
  valueSuffix: string;
}

/**
 * Serializador que utiliza esquemas Avro para la codificación de mensajes Kafka.
 * Este serializador registra y mantiene actualizados los esquemas de Avro mediante el uso de un registro de esquemas.
 */
export class KafkaAvroRequestSerializer implements Serializer<
  KafkaMessageSend,
  Promise<KafkaRequest>
> {
  protected registry: SchemaRegistry;
  protected schemas: Map<string, KafkaSchemaMap> = new Map();
  protected separator: string;
  protected config: KafkaAvroRequestSerializerConfig;
  private readonly lastSchemaFetchInterval: Map<string, number> = new Map();
  /** Registro inicial de esquemas; arranca en el primer `serialize()`, que lo espera antes de codificar. */
  private initialization?: Promise<void>;

  private debugLog(message: string): void {
    if (process.env.KAFKA_TEST_DEBUG === 'true') {
      console.log(`[kafka-serializer] ${message}`);
    }
  }

  /**
   * Construye un serializador de mensajes Kafka usando esquemas Avro.
   *
   * @param {KafkaAvroRequestSerializerConfig} options - Configuración para el serializador que incluye esquemas y detalles de conexión al registro.
   */
  constructor(options: KafkaAvroRequestSerializerConfig) {
    this.registry = new SchemaRegistry(options.config, options.options);
    this.config = {
      schemaFetchIntervalSeconds: 3600,
      ...options,
    };
  }

  /**
   * Starts the initial schema registration once and returns it. A failure (e.g. registry not
   * reachable) is only logged: the topic is registered again by `updateSchemas()`.
   * `registerSchema` always rejects with an `Error`.
   */
  private ensureInitialized(): Promise<void> {
    this.initialization ??= this.initializeSchemas().catch((error: Error) => {
      this.debugLog(`initializeSchemas:error:${error.message}`);
    });
    return this.initialization;
  }

  /**
   * Inicializa los esquemas para los tópicos configurados.
   */
  private async initializeSchemas(): Promise<void> {
    this.debugLog('initializeSchemas:start');
    await Promise.all(
      [...this.config.schemas.values()].map((schema) => {
        this.debugLog(`initializeSchemas:register:${schema.topic}`);
        return this.registerSchema(schema);
      }),
    );
    this.debugLog('initializeSchemas:done');
  }

  /**
   * Registra los esquemas Avro en el registro de esquemas.
   * Registra esquemas para claves y valores si están especificados.
   *
   * @param {KafkaAvroRequestSerializerSchema} schema - Contiene la información del esquema a registrar.
   */
  private async registerSchema(schema: KafkaAvroRequestSerializerSchema): Promise<void | Error> {
    const keySuffix = schema.keySuffix ?? 'key';
    const valueSuffix = schema.valueSuffix ?? 'value';

    try {
      this.debugLog(`registerSchema:start:${schema.topic}`);
      await this.registerKeySchema(schema, keySuffix);
      await this.registerValueSchema(schema, valueSuffix);

      // Only look up subjects that were configured: the registry answers 404 for unknown subjects.
      const keyId = schema.key
        ? (await this.registry.getLatestSchemaId(`${schema.topic}-${keySuffix}`)) || null
        : null;
      const valueId = schema.value
        ? (await this.registry.getLatestSchemaId(`${schema.topic}-${valueSuffix}`)) || null
        : null;

      this.schemas.set(schema.topic, {
        keyId,
        valueId,
        keySuffix,
        valueSuffix,
      });

      this.lastSchemaFetchInterval.set(schema.topic, Date.now());
      this.debugLog(`registerSchema:done:${schema.topic}`);
    } catch (error) {
      /* istanbul ignore next */
      throw new Error(
        `Unable to register schema ID: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * Registra el esquema de clave en el registro de esquemas.
   *
   * @param {KafkaAvroRequestSerializerSchema} schema - Contiene la información del esquema a registrar.
   * @param {string} keySuffix - Sufijo para el esquema de clave.
   */
  private async registerKeySchema(
    schema: KafkaAvroRequestSerializerSchema,
    keySuffix: string,
  ): Promise<void> {
    /* istanbul ignore next */
    if (schema?.key) {
      const keySchema = await readAVSCAsync(schema.key);
      await this.registry.register(
        {
          type: SchemaType.AVRO,
          schema: JSON.stringify(keySchema),
        },
        { subject: `${schema.topic}-${keySuffix}` },
      );
    }
  }

  /**
   * Registra el esquema de valor en el registro de esquemas.
   *
   * @param {KafkaAvroRequestSerializerSchema} schema - Contiene la información del esquema a registrar.
   * @param {string} valueSuffix - Sufijo para el esquema de valor.
   */
  private async registerValueSchema(
    schema: KafkaAvroRequestSerializerSchema,
    valueSuffix: string,
  ): Promise<void> {
    /* istanbul ignore next */
    if (schema?.value) {
      const valueSchema = await readAVSCAsync(schema.value);
      await this.registry.register(
        {
          type: SchemaType.AVRO,
          schema: JSON.stringify(valueSchema),
        },
        { subject: `${schema.topic}-${valueSuffix}` },
      );
    }
  }

  /**
   * Actualiza los esquemas si ha pasado el intervalo de tiempo especificado desde la última actualización.
   *
   * @param {string} topic - El tópico para el cual se actualizarán los esquemas.
   */
  private async updateSchemas(topic: string): Promise<void> {
    const lastCheck = this.lastSchemaFetchInterval.get(topic);
    const configCheckMs = this.config.schemaFetchIntervalSeconds * 1000;
    const now = Date.now();

    /* istanbul ignore next */
    if (!lastCheck || lastCheck + configCheckMs <= now) {
      const config = this.config.schemas.find((schema) => schema.topic === topic);
      if (!config) {
        throw new Error(`No Avro schema configured for topic ${topic}`);
      }
      await this.registerSchema(config);
    }
  }

  /**
   * Encodes a key or value with its schema. Without a schema id the field goes out as is;
   * an empty field stays `null`.
   */
  private async encodeField<T>(schemaId: number | null, field: T): Promise<T | Buffer | null> {
    if (!schemaId) return field;
    if (!field) return null;
    return this.registry.encode(schemaId, field);
  }

  /**
   * Serializa los mensajes utilizando los esquemas Avro registrados.
   * Encapsula los detalles de codificación, asegurando que los mensajes estén listos para ser enviados a Kafka.
   *
   * @param {KafkaMessageSend} data - Los datos que contienen el tópico y los mensajes a enviar.
   * @returns {Promise<KafkaRequest>} Promesa que resuelve a los mensajes Kafka serializados.
   */
  async serialize(data: KafkaMessageSend): Promise<KafkaRequest> {
    const incomingMessages: KafkaMessage[] = Array.isArray(data.messages)
      ? data.messages
      : [data.messages];

    try {
      await this.ensureInitialized();
      await this.updateSchemas(data.topic);
      const { keyId, valueId } = this.schemas.get(data.topic);

      const messages: Promise<KafkaMessage>[] = incomingMessages.map(
        async (origMessage: KafkaMessage) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- origMessage.key is intentionally `any` (see KafkaMessage.key).
          const encodedKey = await this.encodeField(keyId, origMessage.key);
          const encodedValue = await this.encodeField(valueId, origMessage.value);

          return {
            ...origMessage,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- encodedKey inherits the intentional `any` from origMessage.key.
            key: encodedKey,
            value: encodedValue,
          };
        },
      );

      const outgoingMessages = await Promise.all(messages);
      return outgoingMessages[0] as KafkaRequest;
    } catch (error) {
      /* istanbul ignore next */
      throw new Error(
        `Error serializing: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }
}
