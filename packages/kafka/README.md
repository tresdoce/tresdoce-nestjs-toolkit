<div align='left'>
    <img alt="TresdoceLogo" width="180" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoFull.svg"/>
</div>

<div align="center">
    <img alt="Nestjs-logo" width="250" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logo-nestjs.svg"/>
</div>

<div align="center">

# Tresdoce NestJS Toolkit<br/>Kafka

</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Yarn&message=v1.22.22&labelColor=2C8EBB&logoColor=FFFFFF&color=757575&logo=yarn" alt="Yarn"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/>
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/kafka.svg">
  <br/>
</div>

Este módulo está pensado para ser utilizado en la [NestJS Starter](https://github.com/rudemex/nestjs-starter),
siguiendo los lineamientos de arquitectura.

## Glosario

- [📝 Requerimientos básicos](#-requerimientos-básicos)
- [📘 Descripción](#-descripción)
- [🛠️ Instalar dependencia](#-instalar-dependencia)
- [⚙️ Configuración](#-configuración)
- [👨‍💻 Uso](#-uso)
- [🐳 Kafka y Schema Registry en local](#-docker-compose)
- [📚 API Reference](#-api-reference)
- [📄 Changelog](./CHANGELOG.md)

---

<a name="-requerimientos-básicos"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- NodeJS v22.22 o superior ([Download](https://nodejs.org/es/download/))
- Yarn v1.22.22
- NestJS v12 o superior ([Documentación](https://nestjs.com/))
- Un broker Kafka (y un Schema Registry si se usan los serializers Avro). Ver [docker-compose](#-docker-compose).

<a name="-descripción"></a>

## 📘 Descripción

Este paquete integra [Apache Kafka](https://kafka.apache.org/) en aplicaciones NestJS usando [KafkaJS](https://kafka.js.org/):

- `ProducerService` para publicar mensajes en uno o varios tópicos (`sendMessages` / `sendBatchMessages`).
- `ConsumerService` + el decorador `@SubscribeTo(topic)` para consumir mensajes: los handlers se registran
  automáticamente al iniciar la app y corren con `this` apuntando a la instancia del provider/controller,
  así que pueden usar sus dependencias inyectadas.
- Serializers/deserializers JSON por defecto, y variantes **Avro** con
  [Confluent Schema Registry](https://kafkajs.github.io/confluent-schema-registry/) para validar los mensajes contra esquemas.

Usalo cuando tu servicio necesite publicar o reaccionar a eventos de forma asíncrona (event-driven, CDC, integración entre microservicios).

El paquete es ESM-only (`"type": "module"`).

<a name="-instalar-dependencia"></a>

## 🛠️ Instalar dependencia

```bash
npm install -S @tresdoce-nestjs-toolkit/kafka
```

```bash
yarn add @tresdoce-nestjs-toolkit/kafka
```

<a name="-configuración"></a>

## ⚙️ Configuración

El módulo lee su configuración de la key `config.kafka` (`Typings.AppConfig['kafka']`, de tipo `KafkaModuleOptions`)
registrada con `registerAs('config', ...)`. `ConfigModule` debe estar importado con `isGlobal: true`.

```typescript
// src/config/configuration.ts
import { join } from 'node:path';
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/paas';
import {
  KafkaAvroRequestSerializer,
  KafkaAvroResponseDeserializer,
} from '@tresdoce-nestjs-toolkit/kafka';

const schemaRegistryHost = process.env.KAFKA_SCHEMA_REGISTRY_URL; // ej: http://localhost:8085
const schemasDir = join(import.meta.dirname, '..', 'kafka-schemas');

export default registerAs('config', (): Typings.AppConfig => ({
  // ...
  kafka: {
    client: {
      clientId: process.env.APP_NAME,
      brokers: process.env.KAFKA_BROKERS.split(','),
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
    },
    subscribe: {
      fromBeginning: false,
    },
    // Opcionales: si se omiten se usan los serializers JSON por defecto.
    serializer: new KafkaAvroRequestSerializer({
      config: { host: schemaRegistryHost },
      options: {},
      schemas: [
        {
          topic: process.env.KAFKA_TOPIC,
          key: join(schemasDir, 'user-key.schema.avsc'),
          value: join(schemasDir, 'user-value.schema.avsc'),
        },
      ],
    }),
    deserializer: new KafkaAvroResponseDeserializer({ host: schemaRegistryHost }),
  },
  // ...
}));
```

Variables de entorno usadas en el ejemplo (los nombres los define tu app):

```dotenv
APP_NAME=my-service
KAFKA_BROKERS=localhost:9092
KAFKA_CONSUMER_GROUP_ID=my-service-consumer
KAFKA_TOPIC=tresdoce.sampleApi.topic.v1
KAFKA_SCHEMA_REGISTRY_URL=http://localhost:8085
```

### Opciones (`KafkaModuleOptions`)

| Propiedad      | Tipo                                                    | Descripción                                                                                                                      |
| -------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `client`       | `KafkaConfig`                                           | Configuración del cliente KafkaJS (`clientId`, `brokers`, `ssl`, `sasl`, `retry`…). Por defecto `logLevel: NOTHING`.             |
| `consumer`     | `ConsumerConfig`                                        | Configuración del consumer. `groupId` es **obligatorio si hay handlers `@SubscribeTo`**; se usa tal cual (sin sufijos).          |
| `subscribe`    | `{ fromBeginning?: boolean }`                           | Opciones de suscripción. `fromBeginning` por defecto `false`.                                                                    |
| `run`          | `Omit<ConsumerRunConfig, 'eachBatch' \| 'eachMessage'>` | Opciones de `consumer.run()` (`autoCommit`, `partitionsConsumedConcurrently`…). El `eachMessage` lo maneja el módulo.            |
| `producer`     | `ProducerConfig`                                        | Configuración del producer. Por defecto `createPartitioner: Partitioners.LegacyPartitioner`.                                     |
| `serializer`   | `Serializer`                                            | Serializer de salida. Default: `KafkaRequestSerializer` (JSON).                                                                  |
| `deserializer` | `Deserializer`                                          | Deserializer de entrada. Default: `KafkaResponseDeserializer` (JSON).                                                            |
| `seek`         | `Record<string, number \| 'earliest' \| Date>`          | Posiciona el consumer por tópico al unirse al grupo: offset numérico, el offset más bajo (`'earliest'`) o un timestamp (`Date`). |

Más detalle de cada bloque: [client](https://kafka.js.org/docs/configuration) ·
[consumer](https://kafka.js.org/docs/consuming#options) · [producer](https://kafka.js.org/docs/producing#options) ·
[Schema Registry](https://kafkajs.github.io/confluent-schema-registry/).

> Si la app solo produce mensajes, `consumer` puede omitirse: el `ConsumerService` no crea el consumer y no se conecta
> mientras no haya handlers `@SubscribeTo`. Si hay handlers y falta `consumer.groupId`, el arranque falla con
> `Kafka consumer configuration is missing (config.kafka.consumer.groupId).`

### Serializer y deserializer por defecto (JSON)

Si no se configuran, se usan `KafkaRequestSerializer` y `KafkaResponseDeserializer`:

- **Salida**: objetos planos y arrays se convierten con `JSON.stringify`, otros objetos con `toString()`, `undefined` → `null`;
  `string` y `Buffer` se envían tal cual. Si el mensaje no tiene forma `{ key?, value }` se envuelve como `{ value }`. Siempre se agrega `headers: {}`.
- **Entrada**: `key` y headers `Buffer` se convierten a `string`; el `value` se parsea como JSON y, si no es JSON válido, queda como `string`.

### Serializer Avro (`KafkaAvroRequestSerializer`)

Registra los esquemas `.avsc` en el Schema Registry bajo los subjects `<topic>-key` / `<topic>-value` (los sufijos son configurables)
y codifica `key`/`value` con el último schema ID de cada subject.

| Opción                       | Tipo                                 | Default | Descripción                                                                      |
| ---------------------------- | ------------------------------------ | ------- | -------------------------------------------------------------------------------- |
| `config`                     | `SchemaRegistryAPIClientArgs`        | —       | Conexión al registry (`host`, `auth`, `clientId`…).                              |
| `options`                    | `SchemaRegistryAPIClientOptions`     | —       | Opciones extra del cliente del registry (puede ser `{}`).                        |
| `schemas`                    | `KafkaAvroRequestSerializerSchema[]` | —       | Un elemento por tópico: `{ topic, key?, value?, keySuffix?, valueSuffix? }`.     |
| `schemaFetchIntervalSeconds` | `number`                             | `3600`  | Cada cuánto se re-registran/consultan los schema IDs de un tópico al serializar. |
| `schemaSeparator`            | `string`                             | —       | Reservado: actualmente no se usa (el separador del subject es siempre `-`).      |

Comportamiento:

- El registro inicial corre en background al construir el serializer. Si el registry no responde en el arranque **no tira la app**:
  el registro se reintenta en el primer `serialize()` de ese tópico.
- `key` y `value` son independientes: si solo se configura `value`, la key se envía sin codificar Avro.
- Serializar a un tópico que no está en `schemas` falla con `Error serializing: No Avro schema configured for topic <topic>`.

### Deserializer Avro (`KafkaAvroResponseDeserializer`)

`new KafkaAvroResponseDeserializer(config: SchemaRegistryAPIClientArgs, options?: SchemaRegistryAPIClientOptions)`.

Decodifica `key` y `value` con el registry. Si el mensaje no está codificado en Avro (o falla la decodificación),
hace fallback a `KafkaResponseDeserializer` (JSON), por lo que puede convivir con tópicos JSON.

<a name="-uso"></a>

## 👨‍💻 Uso

Importar `KafkaModule` una sola vez en `app.module.ts` (es `@Global()`).

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@tresdoce-nestjs-toolkit/kafka';

import configuration from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), KafkaModule],
})
export class AppModule {}
```

### Enviar mensajes

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { ProducerService, type KafkaMessage } from '@tresdoce-nestjs-toolkit/kafka';

@Injectable()
export class UsersService {
  constructor(private readonly producer: ProducerService) {}

  async publishUser(): Promise<void> {
    const message: KafkaMessage = {
      key: '123456-ABCDEFG',
      value: { id: 1, firstName: 'Foo', lastName: 'Bar' },
      headers: { 'x-origin': 'users-api' },
    };

    // Un mensaje o un array de mensajes al mismo tópico.
    await this.producer.sendMessages('tresdoce.sampleApi.topic.v1', message);
  }

  async publishBatch(): Promise<void> {
    await this.producer.sendBatchMessages([
      {
        topic: 'testTopicB',
        messages: [
          { key: '123', value: 'Message 1 for topic B' },
          { key: '124', value: 'Message 2 for topic B' },
        ],
      },
      { topic: 'testTopicC', messages: [{ key: '321', value: { ok: true } }] },
    ]);
  }
}
```

Firmas: `sendMessages(topic, messages, acks = -1, timeout = 30000, compression = CompressionTypes.GZIP)` y
`sendBatchMessages(topicMessages, acks = -1, timeout = 30000, compression = CompressionTypes.GZIP)`. Ambos devuelven `Promise<void>`.

La conexión del producer se abre en el primer envío, **se reutiliza** en los siguientes (también ante envíos concurrentes)
y se cierra en `onModuleDestroy` (habilitá `app.enableShutdownHooks()` para que ocurra al recibir `SIGTERM`).
Si el broker se desconecta, el siguiente envío vuelve a conectar. También podés llamar `producer.connect()` en el arranque
para fallar rápido si el broker no está disponible.

Ante un error se lanza un `Error` con contexto y el error original en `cause`:

```text
Error: Error sending message(s) to topic tresdoce.sampleApi.topic.v1: Connection timeout
    [cause]: KafkaJSConnectionError: Connection timeout
```

### Consumir mensajes

Decorar con `@SubscribeTo(topic)` un método de un provider o controller registrado en algún módulo de la app.
Al iniciar, `ConsumerService` se conecta, se suscribe a todos los tópicos decorados y empieza a consumir.

```typescript
// src/users/users.consumer.ts
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeTo, type KafkaResponse } from '@tresdoce-nestjs-toolkit/kafka';

import { UsersRepository } from './users.repository.js';

interface UserEvent {
  id: number;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UsersConsumer {
  private readonly logger = new Logger(UsersConsumer.name);

  constructor(private readonly repository: UsersRepository) {}

  @SubscribeTo('tresdoce.sampleApi.topic.v1')
  async onUser(payload: KafkaResponse<UserEvent> & { partition: number }): Promise<void> {
    // `this` es la instancia del provider: las dependencias inyectadas están disponibles.
    await this.repository.save(payload.value);
    this.logger.log(`user ${payload.value.id} received (offset ${payload.offset})`);
  }
}
```

Payload que recibe el handler (deserializer JSON por defecto):

```json
{
  "key": "123456-ABCDEFG",
  "value": { "id": 1, "firstName": "Foo", "lastName": "Bar" },
  "offset": "42",
  "timestamp": "1735689600000",
  "headers": { "x-origin": "users-api" },
  "partition": 0
}
```

> `offset` y `timestamp` llegan como `string` (tal como los entrega KafkaJS), aunque `KafkaResponse.offset` esté tipado como `number`.

Notas:

- Hay **un handler por tópico** a nivel proceso: si dos métodos se suscriben al mismo tópico, gana el último decorado.
- Si el handler lanza un error, se propaga a KafkaJS como
  `Error handling message for topic <topic>: <mensaje>` (con `cause`), que reintenta el mensaje según `client.retry`.
- Si `consumer.run()` falla, se loguea con el `Logger` de Nest (`[ConsumerService] Kafka consumer run failed: ...`).
- El arranque espera a que el consumer se una al grupo (timeout de 5 s) y reintenta la lectura de offsets y los `seek`
  hasta 5 veces cada 500 ms, para tolerar brokers que todavía están propagando metadata.
- Con `KAFKA_TEST_DEBUG=true` se imprimen trazas `[kafka-consumer]` / `[kafka-serializer]` por consola.

### Schema Registry con Avro

Para conocer qué tipos acepta un schema Avro, revisá [Apache Avro - Specification](https://avro.apache.org/docs/1.11.1/specification/).

```json
// kafka-schemas/user-key.schema.avsc
{
  "type": "record",
  "namespace": "my.topic.v1",
  "name": "key",
  "fields": [{ "name": "id", "type": "string", "doc": "Identificador único del usuario." }]
}
```

```json
// kafka-schemas/user-value.schema.avsc
{
  "type": "record",
  "namespace": "my.topic.v1",
  "name": "value",
  "fields": [
    { "name": "id", "type": "int" },
    { "name": "firstName", "type": "string" },
    { "name": "lastName", "type": "string" },
    {
      "name": "seniority",
      "type": {
        "type": "enum",
        "name": "Seniority",
        "symbols": ["trainee", "jr", "semisenior", "senior"]
      }
    }
  ]
}
```

Con esos esquemas, el mensaje se envía como objeto y se recibe decodificado:

```typescript
await this.producer.sendMessages('tresdoce.sampleApi.topic.v1', {
  key: { id: 'a3f1c2' },
  value: { id: 1, firstName: 'Foo', lastName: 'Bar', seniority: 'senior' },
});
```

```json
{
  "key": { "id": "a3f1c2" },
  "value": { "id": 1, "firstName": "Foo", "lastName": "Bar", "seniority": "senior" },
  "offset": "7",
  "timestamp": "1735689600000",
  "headers": {},
  "partition": 0
}
```

Los subjects quedan registrados como `tresdoce.sampleApi.topic.v1-key` y `tresdoce.sampleApi.topic.v1-value`.

<a name="-docker-compose"></a>

## 🐳 Kafka y Schema Registry en local

`docker-compose.yml` mínimo con Kafka en modo **KRaft** (sin Zookeeper) y Confluent Schema Registry:

```yaml
services:
  kafka:
    image: confluentinc/cp-kafka:7.8.0
    container_name: kafka
    ports:
      - '9092:9092'
    environment:
      # KRaft: el mismo nodo hace de broker y controller.
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
      KAFKA_LISTENERS: PLAINTEXT://:29092,CONTROLLER://:29093,PLAINTEXT_HOST://:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    healthcheck:
      test: ['CMD-SHELL', 'kafka-topics --bootstrap-server kafka:29092 --list >/dev/null 2>&1']
      interval: 5s
      timeout: 10s
      retries: 30

  schema-registry:
    image: confluentinc/cp-schema-registry:7.8.0
    container_name: schema-registry
    depends_on:
      kafka:
        condition: service_healthy
    ports:
      - '8085:8085'
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka:29092
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8085
    healthcheck:
      test: ['CMD-SHELL', 'curl -fs http://localhost:8085/subjects >/dev/null']
      interval: 5s
      timeout: 5s
      retries: 30
```

```bash
docker compose up -d
```

Desde la app (fuera de Docker) usá `KAFKA_BROKERS=localhost:9092` y `KAFKA_SCHEMA_REGISTRY_URL=http://localhost:8085`.
Si la app corre dentro de la misma red de Docker, usá `kafka:29092` y `http://schema-registry:8085`.

Para listar los subjects registrados:

```bash
curl http://localhost:8085/subjects
# ["tresdoce.sampleApi.topic.v1-key","tresdoce.sampleApi.topic.v1-value"]
```

<a name="-api-reference"></a>

## 📚 API Reference

| Export                             | Tipo      | Descripción                                                                                                                    |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `KafkaModule`                      | Módulo    | `@Global()`. Provee y exporta `ProducerService`, `ConsumerService` y `KAFKA_MODULE_OPTIONS` (lee `config.kafka`).              |
| `ProducerService`                  | Servicio  | `connect()`, `disconnect()`, `sendMessages(...)`, `sendBatchMessages(...)`. Implementa `OnModuleDestroy`.                      |
| `ConsumerService`                  | Servicio  | `connect()`, `disconnect()`, `isConsumerConnected()`, `bindAllTopicToConsumer()`. Implementa `OnModuleInit`/`OnModuleDestroy`. |
| `SubscribeTo(topic)`               | Decorador | Registra el método como handler del tópico.                                                                                    |
| `SUBSCRIBER_MAP`                   | `Map`     | `topic → handler`.                                                                                                             |
| `SUBSCRIBER_CLASS_MAP`             | `Map`     | `topic → clase` que declaró el handler (se resuelve con `ModuleRef`).                                                          |
| `SUBSCRIBER_OBJECT_MAP`            | `Map`     | `topic → instancia` usada como `this`. Las entradas cargadas a mano tienen prioridad.                                          |
| `SCHEMAS`                          | `Map`     | Reservado (sin uso interno).                                                                                                   |
| `KAFKA_MODULE_OPTIONS`             | `Symbol`  | Token de inyección de `KafkaModuleOptions`.                                                                                    |
| `KafkaRequestSerializer`           | Clase     | Serializer JSON por defecto. Expone `serialize(data)` y `encode(value)`.                                                       |
| `KafkaResponseDeserializer`        | Clase     | Deserializer JSON por defecto.                                                                                                 |
| `KafkaAvroRequestSerializer`       | Clase     | Serializer Avro con Schema Registry.                                                                                           |
| `KafkaAvroResponseDeserializer`    | Clase     | Deserializer Avro con fallback a JSON.                                                                                         |
| `KafkaAvroRequestSerializerConfig` | Tipo      | Opciones de `KafkaAvroRequestSerializer`.                                                                                      |
| `KafkaModuleOptions`               | Interfaz  | Opciones del módulo (ver [Configuración](#-configuración)).                                                                    |
| `KafkaMessage`                     | Tipo      | `{ key?, value, partition?, headers?, timestamp? }` — mensaje a enviar.                                                        |
| `KafkaMessageSend`                 | Interfaz  | `{ topic, messages }` — entrada de los serializers.                                                                            |
| `KafkaRequest<T>`                  | Interfaz  | `{ key, value, topic, headers }` — salida de los serializers.                                                                  |
| `KafkaResponse<T>`                 | Interfaz  | `{ key, value, headers?, timestamp, offset }` — salida de los deserializers.                                                   |
| `IHeaders`                         | Interfaz  | Headers deserializados (`Record<string, any>`).                                                                                |
| `SubscriberHandler`                | Tipo      | Firma de los handlers registrados.                                                                                             |

<a name="-changelog"></a>

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<br/>
<div align="center">
    <p>
        <br/><img src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoIcon.svg" width="84" alt="TresdoceIcon" /><br/>
        Made with ❤
    </p>
</div>
