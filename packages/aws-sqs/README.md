<div align="center">
  <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
  <h1>Tresdoce NestJS Toolkit<br/>AWS SQS</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
  <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
  <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/aws-sqs.svg">
  <br/>
</div>
<br/>

Módulo para enviar, recibir y consumir mensajes de **AWS Simple Queue Service (SQS)** usando
[`@aws-sdk/client-sqs`](https://www.npmjs.com/package/@aws-sdk/client-sqs) v3. Expone:

- `AwsSqsService`: envío (`sendMessage`), recepción (`receiveMessage`) y borrado (`deleteMessage`) de mensajes
  referenciando cada cola por un **nombre lógico** definido en la configuración.
- `@AwsSqsMessageHandler(queueName)`: decorador que convierte un método de un controller en un consumidor; el
  `AwsSqsListener` hace polling de la cola y borra el mensaje cuando el handler termina sin errores.

Usalo cuando tu aplicación necesite publicar trabajos asíncronos o consumir eventos desde colas SQS (estándar o FIFO).

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [🐳 Entorno local (LocalStack)](#local-environment)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/aws-sqs
```

```
yarn add @tresdoce-nestjs-toolkit/aws-sqs
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de la configuración de **AWS Simple Queue Service** en `configuration.ts` utilizando el key `sqs`
(`Typings.AppConfig['sqs']`, de tipo `AwsSqsModuleOptions`) que obtenga los datos desde las variables de entorno.
Cuando se importa `AwsSqsModule` sin argumentos, el módulo lee `config.sqs` desde el `ConfigService`
(`ConfigModule` debe estar registrado con `isGlobal: true`).

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    sqs: {
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      queues: [
        {
          name: process.env.AWS_SQS_QUEUE_NAME_1,
          url: process.env.AWS_SQS_QUEUE_URL_1,
        },
        {
          name: process.env.AWS_SQS_QUEUE_NAME_2,
          url: process.env.AWS_SQS_QUEUE_URL_2,
        },
      ],
    },
    //...
  };
});
```

```bash
# .env
AWS_REGION=us-east-1
AWS_SQS_ENDPOINT=http://localhost:4566 # sólo para LocalStack/ElasticMQ, omitir en AWS
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_SQS_QUEUE_NAME_1=orders
AWS_SQS_QUEUE_URL_1=http://localhost:4566/000000000000/orders
AWS_SQS_QUEUE_NAME_2=notifications
AWS_SQS_QUEUE_URL_2=http://localhost:4566/000000000000/notifications
```

> `AwsSqsModuleOptions` extiende `SQSClientConfig`, por lo que cualquier opción del cliente del SDK (`maxAttempts`,
> `requestHandler`, `logger`, etc.) puede agregarse junto a `queues`. La propiedad `queues` no se envía al `SQSClient`.
> Si no se definen `credentials`, el SDK usa su cadena de credenciales por defecto (variables de entorno, perfil, IAM
> role, etc.).

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`region`: Es la region de la cuenta de AWS.

- Type: `String`
- Required: `true`
- Values: `us-east-1`

`endpoint`: Es el contexto de AWS y se utiliza para especificar la URL del servicio al que se quiere conectar. Es útil
para apuntar a emuladores locales como LocalStack.

- Type: `String`
- Required: `false`
- Values: `https://sqs.us-east-1.amazonaws.com | http://localhost:4566`

#### credentials

Credenciales de la cuenta de AWS.

`accessKeyId`: Es el Access Key ID de AWS.

- Type: `String`
- Required: `false` (si se omite `credentials` se usa la cadena por defecto del SDK)

`secretAccessKey`: Es el Secret Access Key de AWS.

- Type: `String`
- Required: `false` (si se omite `credentials` se usa la cadena por defecto del SDK)

#### queues

Es la lista de las colas registradas. Cada ítem requiere el nombre lógico y la URL de la cola.

- Type: `Array<QueueConfig>`
- Required: `true`

`queues[].name`: Nombre lógico de la cola. Se utiliza como identificador en toda la aplicación.

- Type: `String`
- Required: `true`

`queues[].url`: URL completa de la cola en AWS SQS.

- Type: `String`
- Required: `true`

`queues[].attributes`: Atributos opcionales adicionales de la cola.

- Type: `Record<string, string>`
- Required: `false`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importar el módulo

Importar el `AwsSqsModule` en el archivo `app.module.ts`. El módulo está marcado como `@Global()`, por lo que una vez
registrado queda disponible en toda la aplicación sin necesidad de importarlo nuevamente en cada módulo.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Module({
  imports: [
    //...
    AwsSqsModule,
    //...
  ],
})
export class AppModule {}
```

> Cuando se usa `AwsSqsModule` sin argumentos, la configuración se obtiene automáticamente desde `config.sqs` del
> `ConfigService`. También es posible configurar el módulo de manera sincrónica o asincrónica utilizando los métodos
> `register`, `registerAsync`, `forRoot` y `forRootAsync` (ver sección [Métodos de instanciamiento](#instantiation-methods)).

### Enviar mensajes

Inyectar `AwsSqsService` y usar el método `sendMessage` para publicar mensajes en una cola.

```typescript
import { Injectable } from '@nestjs/common';
import { AwsSqsService } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Injectable()
export class OrdersService {
  constructor(private readonly awsSqsService: AwsSqsService) {}

  async sendOrder(): Promise<string | undefined> {
    const { MessageId } = await this.awsSqsService.sendMessage({
      queueName: 'orders',
      messageBody: { orderId: 123, product: 'Laptop' }, // los objetos se serializan con JSON.stringify
      delaySeconds: 5,
      messageAttributes: {
        Priority: { DataType: 'String', StringValue: 'High' },
      },
    });
    return MessageId;
  }
}
```

`sendMessage` devuelve el `SendMessageCommandOutput` del SDK:

```json
{
  "$metadata": {
    "httpStatusCode": 200,
    "requestId": "6f1c...",
    "attempts": 1,
    "totalRetryDelay": 0
  },
  "MD5OfMessageBody": "3c1a0b2e5d8f4e6a9b7c0d1e2f3a4b5c",
  "MD5OfMessageAttributes": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  "MessageId": "a4b8c1e2-3f4d-4e5a-9b6c-7d8e9f0a1b2c"
}
```

Log generado:

```
[Nest] 12345  - LOG [AwsSqsService] Message sent to queue "orders" (MessageId: a4b8c1e2-3f4d-4e5a-9b6c-7d8e9f0a1b2c).
```

Para colas **FIFO** (`*.fifo`) indicar `groupId` y, si la cola no tiene _content-based deduplication_,
`deduplicationId`:

```typescript
await this.awsSqsService.sendMessage({
  queueName: 'payments',
  messageBody: { paymentId: 'p-1' },
  groupId: 'customer-42',
  deduplicationId: 'p-1',
});
```

### Recibir y eliminar mensajes manualmente

```typescript
import { Controller, Get } from '@nestjs/common';
import { AwsSqsService, type Message } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Controller('orders')
export class OrdersController {
  constructor(private readonly awsSqsService: AwsSqsService) {}

  @Get('receive')
  async receiveOrder(): Promise<any> {
    const messages: Message[] = await this.awsSqsService.receiveMessage('orders', 5, 10);
    if (messages.length > 0) {
      for (const msg of messages) {
        console.log('Received message:', msg.Body);
        await this.awsSqsService.deleteMessage('orders', msg.ReceiptHandle!);
      }
      return messages;
    }
    return { message: 'No messages available' };
  }
}
```

Respuesta HTTP de ejemplo (`GET /orders/receive`):

```json
[
  {
    "MessageId": "a4b8c1e2-3f4d-4e5a-9b6c-7d8e9f0a1b2c",
    "ReceiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
    "MD5OfBody": "3c1a0b2e5d8f4e6a9b7c0d1e2f3a4b5c",
    "Body": "{\"orderId\":123,\"product\":\"Laptop\"}"
  }
]
```

> `Body` siempre es un `string`: si se envió un objeto, hay que hacer `JSON.parse(message.Body)`.

> `Message` es el tipo re-exportado desde `@aws-sdk/client-sqs`. Puede usarse para tipar los argumentos de los handlers.

### Consumo automático con el decorador `@AwsSqsMessageHandler`

El decorador `@AwsSqsMessageHandler(queueName)` se coloca sobre un método de un **controller** para registrar un handler
de mensajes. El `AwsSqsListener` descubre automáticamente estos handlers al iniciar el módulo y comienza a hacer polling
a la cola indicada.

**El método decorado debe estar dentro de una clase anotada con `@Controller()`**, ya que el listener escanea únicamente
los controllers registrados en la aplicación (los providers/servicios no se escanean). Los controllers con scope
`REQUEST` se ignoran porque no tienen una instancia estática.

```typescript
import { Controller } from '@nestjs/common';
import { AwsSqsMessageHandler, type Message } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Controller()
export class OrdersController {
  @AwsSqsMessageHandler('orders')
  async handleOrderMessage(message: Message): Promise<void> {
    const order = JSON.parse(message.Body ?? '{}');
    console.log(`Processing order ${order.orderId}`);
    // Si se lanza una excepción, el mensaje NO se borra y vuelve a estar visible al vencer el visibility timeout.
  }
}
```

Logs al iniciar y procesar un mensaje:

```
[Nest] 12345  - LOG [AwsSqsListener] Handler found for queue: orders
[Nest] 12345  - LOG [AwsSqsListener] Listening to queue: orders
[Nest] 12345  - LOG [AwsSqsService] Received 1 message(s) from queue "orders".
[Nest] 12345  - LOG [AwsSqsService] Message deleted from queue "orders".
[Nest] 12345  - LOG [AwsSqsListener] Message deleted: a4b8c1e2-3f4d-4e5a-9b6c-7d8e9f0a1b2c
[Nest] 12345  - ERROR [AwsSqsListener] Error processing message a4b8c1e2-...: <mensaje de la excepción>
```

#### Comportamiento del listener

- El `AwsSqsListener` inicia el polling al arrancar el módulo (`onModuleInit`) y se detiene al destruirlo
  (`onModuleDestroy`). El loop corre en segundo plano y no bloquea el arranque de la app.
- Cada poll usa `receiveMessage(queueName)` con los valores por defecto: **1 mensaje** por request y **long polling de
  20 segundos**. Después de cada poll se espera **1 segundo** antes del siguiente.
- Los mensajes sin `ReceiptHandle` se procesan pero no se borran.
- Los errores al hacer polling (red, permisos, cola inexistente en AWS) se loguean como `Error polling queue <name>: ...`
  y el loop continúa.
- Los logs de "sin mensajes" (`No messages received from <queue>.` / `No messages available in queue "<queue>".`) se
  emiten con nivel `debug` para no llenar los logs en cada poll vacío.
- Al destruir el módulo, `AwsSqsService` libera el `SQSClient` (`sqsClient.destroy()`).
- Los mensajes se eliminan de la cola **solo si el handler finaliza sin errores**. Si el handler lanza una excepción,
  el mensaje **no se elimina** y permanece en la cola para ser re-procesado.
- Si la cola especificada no existe en la configuración, se lanza el error: `Error: Queue "<queueName>" not found`.

### Inyectar la configuración de una cola

Con `register` / `forRoot` (configuración sincrónica) cada cola se registra como provider con el token
`AWS_SQS_QUEUE_<NOMBRE_EN_MAYÚSCULAS>`, que se obtiene con `getAwsSqsQueueToken(name)`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { getAwsSqsQueueToken, type QueueConfig } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Injectable()
export class OrdersQueueInfo {
  constructor(@Inject(getAwsSqsQueueToken('orders')) private readonly ordersQueue: QueueConfig) {}

  getUrl(): string {
    return this.ordersQueue.url;
  }
}
```

> Con `AwsSqsModule` (sin argumentos), `registerAsync` y `forRootAsync` las colas no se conocen al definir el módulo, por
> lo que estos tokens individuales no existen. En esos casos inyectar `AWS_SQS_MODULE_OPTIONS` y buscar la cola en
> `options.queues`.

<a name="instantiation-methods"></a>

### Métodos de instanciamiento

#### Configuración sincrónica (`register`)

Utilizar cuando toda la configuración es conocida en tiempo de arranque.

```typescript
import { Module } from '@nestjs/common';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Module({
  imports: [
    AwsSqsModule.register({
      region: 'us-east-1',
      endpoint: 'https://sqs.us-east-1.amazonaws.com',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      queues: [
        { name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456789/orders' },
        {
          name: 'notifications',
          url: 'https://sqs.us-east-1.amazonaws.com/123456789/notifications',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

#### Configuración asíncronica (`registerAsync`)

Ideal cuando los valores se cargan desde un servicio como `ConfigService`. Soporta las opciones `useFactory`,
`useClass` y `useExisting`.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Module({
  imports: [
    AwsSqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('config.sqs'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

Con `useClass` (implementando `AwsSqsModuleOptionsFactory`):

```typescript
import { Injectable, Module } from '@nestjs/common';
import {
  AwsSqsModule,
  type AwsSqsModuleOptions,
  type AwsSqsModuleOptionsFactory,
} from '@tresdoce-nestjs-toolkit/aws-sqs';

@Injectable()
class SqsConfigService implements AwsSqsModuleOptionsFactory {
  async createOptions(): Promise<AwsSqsModuleOptions> {
    return {
      region: 'us-east-1',
      queues: [{ name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456789/orders' }],
    };
  }
}

@Module({
  imports: [
    AwsSqsModule.registerAsync({
      useClass: SqsConfigService,
    }),
  ],
})
export class AppModule {}
```

#### Configuración global sincrónica (`forRoot`)

Registra el módulo de forma global. No es necesario importarlo en los módulos hijos.

```typescript
import { Module } from '@nestjs/common';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Module({
  imports: [
    AwsSqsModule.forRoot({
      region: 'us-east-1',
      endpoint: 'https://sqs.us-east-1.amazonaws.com',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      queues: [
        { name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456789/orders' },
        {
          name: 'notifications',
          url: 'https://sqs.us-east-1.amazonaws.com/123456789/notifications',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

#### Configuración global asíncronica (`forRootAsync`)

Global y asíncrona. Recomendado cuando la configuración depende de variables de entorno o servicios externos.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Module({
  imports: [
    AwsSqsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('config.sqs'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

<a name="local-environment"></a>

## 🐳 Entorno local (LocalStack)

[LocalStack](https://www.localstack.cloud/) emula SQS en `http://localhost:4566`. Este `docker-compose.yml` mínimo
levanta SQS y crea las colas `orders` y `notifications` al iniciar (script en `ready.d`):

```yaml
# docker-compose.yml
services:
  localstack:
    image: localstack/localstack:4
    ports:
      - '4566:4566'
    environment:
      SERVICES: sqs
      AWS_DEFAULT_REGION: us-east-1
      # LOCALSTACK_AUTH_TOKEN: ${LOCALSTACK_AUTH_TOKEN} # requerido por las imágenes más recientes de LocalStack
    volumes:
      - ./localstack/init-sqs.sh:/etc/localstack/init/ready.d/init-sqs.sh
```

```bash
#!/bin/bash
# ./localstack/init-sqs.sh (darle permisos de ejecución: chmod +x)
awslocal sqs create-queue --queue-name orders
awslocal sqs create-queue --queue-name notifications
awslocal sqs list-queues
```

```bash
docker compose up -d
```

Con este entorno, la configuración es `endpoint: http://localhost:4566`, credenciales `test`/`test` y las URLs de las
colas `http://localhost:4566/000000000000/<queue>`.

<details>
<summary>💬 Alternativa liviana con ElasticMQ</summary>

[ElasticMQ](https://github.com/softwaremill/elasticmq) implementa la API de SQS sin necesidad de cuenta:

```yaml
services:
  elasticmq:
    image: softwaremill/elasticmq-native
    ports:
      - '9324:9324' # API SQS
      - '9325:9325' # UI
    volumes:
      - ./elasticmq.conf:/opt/elasticmq.conf
```

```hocon
# ./elasticmq.conf
include classpath("application.conf")
queues {
  orders {}
  notifications {}
}
```

Configurar `endpoint: http://localhost:9324` y las URLs `http://localhost:9324/000000000000/<queue>`.

</details>

### Comandos útiles con AWS CLI

Para las credenciales usa `test`, para la región `us-east-1` y para el output `json`.

```
aws configure --profile localstack
```

#### Crear una cola

```
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name orders
```

#### Listar colas

```
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

#### Enviar un mensaje

```
aws --endpoint-url=http://localhost:4566 sqs send-message --queue-url http://localhost:4566/000000000000/orders --message-body "Order 123: Laptop"
```

#### Recibir mensajes

```
aws --endpoint-url=http://localhost:4566 sqs receive-message --queue-url http://localhost:4566/000000000000/orders
```

```json
{
  "Messages": [
    {
      "MessageId": "12345",
      "ReceiptHandle": "abc123",
      "MD5OfBody": "8f2d...",
      "Body": "Order 123: Laptop"
    }
  ]
}
```

#### Eliminar un mensaje

```
aws --endpoint-url=http://localhost:4566 sqs delete-message --queue-url http://localhost:4566/000000000000/orders --receipt-handle abc123
```

#### Eliminar una cola

```
aws --endpoint-url=http://localhost:4566 sqs delete-queue --queue-url http://localhost:4566/000000000000/orders
```

<a name="api-reference"></a>

## 📖 API Reference

### Exports

| Export                                                                                                               | Tipo       | Descripción                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `AwsSqsModule`                                                                                                       | Módulo     | `@Global()`. Sin argumentos lee `config.sqs`; también `register`, `registerAsync`, `forRoot`, `forRootAsync` |
| `AwsSqsService`                                                                                                      | Servicio   | Envío, recepción y borrado de mensajes                                                                       |
| `AwsSqsMessageHandler`                                                                                               | Decorador  | Marca un método de controller como consumidor de una cola                                                    |
| `getAwsSqsQueueToken(name)`                                                                                          | Función    | Token `AWS_SQS_QUEUE_<NAME>` de una cola (sólo `register`/`forRoot`)                                         |
| `AWS_SQS_MODULE_OPTIONS`                                                                                             | Token      | Opciones resueltas del módulo (`AwsSqsModuleOptions`)                                                        |
| `AWS_SQS_QUEUE_PROVIDERS`                                                                                            | Token      | Array `{ provide, useValue }` con una entrada por cola                                                       |
| `AWS_SQS_MESSAGE_HANDLER`                                                                                            | Constante  | Metadata key usada por el decorador                                                                          |
| `AWS_SQS_QUEUE`                                                                                                      | Constante  | Prefijo de los tokens de cola (`'AWS_SQS_QUEUE'`)                                                            |
| `AwsSqsModuleOptions`, `QueueConfig`, `SendMessageOptions`, `AwsSqsModuleAsyncOptions`, `AwsSqsModuleOptionsFactory` | Interfaces | Ver abajo                                                                                                    |
| `Message`                                                                                                            | Tipo       | Re-export de `@aws-sdk/client-sqs`                                                                           |

### `AwsSqsService`

Servicio principal para interactuar con AWS SQS.

#### `sendMessage(options: SendMessageOptions): Promise<SendMessageCommandOutput>`

Envía un mensaje a la cola especificada. Si el cuerpo es un objeto, se serializa como JSON. Devuelve la respuesta del
SDK (incluye `MessageId`). Lanza `Error: Message body must be a string or a non-null object` si el body no es válido.

| Propiedad           | Tipo                                    | Requerido | Descripción                                |
| ------------------- | --------------------------------------- | :-------: | ------------------------------------------ |
| `queueName`         | `string`                                |    Si     | Nombre lógico de la cola                   |
| `messageBody`       | `string \| object`                      |    Si     | Cuerpo del mensaje                         |
| `delaySeconds`      | `number`                                |    No     | Retraso en segundos antes de publicar      |
| `messageAttributes` | `Record<string, MessageAttributeValue>` |    No     | Atributos adicionales del mensaje          |
| `groupId`           | `string`                                |    No     | ID de grupo (solo para colas FIFO)         |
| `deduplicationId`   | `string`                                |    No     | ID de deduplicación (solo para colas FIFO) |

Lanza `Error: Queue "<queueName>" not found` si la cola no está registrada en la configuración.

#### `receiveMessage(queueName, maxNumberOfMessages?, waitTimeSeconds?): Promise<Message[]>`

Recibe mensajes de la cola especificada. Devuelve los mensajes recibidos o un array vacío si no hay mensajes.

| Parámetro             | Tipo     | Requerido | Default | Descripción                                   |
| --------------------- | -------- | :-------: | :-----: | --------------------------------------------- |
| `queueName`           | `string` |    Si     |    —    | Nombre lógico de la cola                      |
| `maxNumberOfMessages` | `number` |    No     |   `1`   | Número máximo de mensajes a recibir (máx. 10) |
| `waitTimeSeconds`     | `number` |    No     |  `20`   | Tiempo de espera en segundos (long polling)   |

Lanza `Error: Queue "<queueName>" not found` si la cola no está registrada en la configuración.

#### `deleteMessage(queueName: string, receiptHandle: string): Promise<void>`

Elimina un mensaje de la cola utilizando su `ReceiptHandle`.

| Parámetro       | Tipo     | Requerido | Descripción                      |
| --------------- | -------- | :-------: | -------------------------------- |
| `queueName`     | `string` |    Si     | Nombre lógico de la cola         |
| `receiptHandle` | `string` |    Si     | `ReceiptHandle` devuelto por SQS |

Lanza `Error: Queue "<queueName>" not found` si la cola no está registrada en la configuración.

---

### `AwsSqsMessageHandler(queueName: string)`

Decorador de método que registra un handler de mensajes para la cola indicada. El método debe pertenecer a una clase
decorada con `@Controller()` y recibe un `Message` como argumento.

---

### Interfaces exportadas

#### `AwsSqsModuleOptions`

Extiende `SQSClientConfig` del SDK de AWS e incluye:

| Propiedad | Tipo            | Descripción                |
| --------- | --------------- | -------------------------- |
| `queues`  | `QueueConfig[]` | Lista de colas registradas |

#### `QueueConfig`

| Propiedad    | Tipo                     | Requerido | Descripción                     |
| ------------ | ------------------------ | :-------: | ------------------------------- |
| `name`       | `string`                 |    Si     | Nombre lógico de la cola        |
| `url`        | `string`                 |    Si     | URL completa de la cola en SQS  |
| `attributes` | `Record<string, string>` |    No     | Atributos opcionales de la cola |

#### `SendMessageOptions`

| Propiedad           | Tipo                                    | Requerido | Descripción                         |
| ------------------- | --------------------------------------- | :-------: | ----------------------------------- |
| `queueName`         | `string`                                |    Si     | Nombre lógico de la cola            |
| `messageBody`       | `string \| object`                      |    Si     | Cuerpo del mensaje                  |
| `delaySeconds`      | `number`                                |    No     | Retraso en segundos                 |
| `messageAttributes` | `Record<string, MessageAttributeValue>` |    No     | Atributos adicionales del mensaje   |
| `groupId`           | `string`                                |    No     | ID de grupo para colas FIFO         |
| `deduplicationId`   | `string`                                |    No     | ID de deduplicación para colas FIFO |

#### `AwsSqsModuleAsyncOptions`

Opciones para registro asíncrono del módulo.

| Propiedad        | Tipo                               | Descripción                                                |
| ---------------- | ---------------------------------- | ---------------------------------------------------------- |
| `useFactory`     | `(...args) => AwsSqsModuleOptions` | Función factory para construir las opciones dinámicamente  |
| `useClass`       | `Type<AwsSqsModuleOptionsFactory>` | Clase que implementa `AwsSqsModuleOptionsFactory`          |
| `useExisting`    | `Type<AwsSqsModuleOptionsFactory>` | Reutiliza un provider existente que implemente la interfaz |
| `inject`         | `any[]`                            | Dependencias a inyectar en la factory                      |
| `imports`        | `ModuleMetadata['imports']`        | Módulos adicionales a importar                             |
| `extraProviders` | `Provider[]`                       | Providers adicionales a registrar en el módulo             |

#### `AwsSqsModuleOptionsFactory`

| Método          | Tipo                                                        |
| --------------- | ----------------------------------------------------------- |
| `createOptions` | `() => Promise<AwsSqsModuleOptions> \| AwsSqsModuleOptions` |

#### `Message`

Tipo re-exportado desde `@aws-sdk/client-sqs`. Úsalo para tipar el parámetro de los handlers de mensajes.

```typescript
import type { Message } from '@tresdoce-nestjs-toolkit/aws-sqs';
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
  <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
    <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
  </a><br/>
  <p>Made with ❤</p>
</div>
