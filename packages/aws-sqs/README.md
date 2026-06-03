<div align="center">
  <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
  <h1>Tresdoce NestJS Toolkit<br/>AWS SQS</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
  <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
  <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/aws-sqs.svg">
  <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.21.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v11.1.11 or higher ([Documentación](https://nestjs.com/))

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

Agregar los datos de la configuración de **AWS Simple Queue Service** en `configuration.ts` utilizando el key `sqs` que
obtenga los datos desde las variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/paas';
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
- Required: `true`

`secretAccessKey`: Es el Secret Access Key de AWS.

- Type: `String`
- Required: `true`

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

  async sendOrder(): Promise<void> {
    await this.awsSqsService.sendMessage({
      queueName: 'orders',
      messageBody: { orderId: 123, product: 'Laptop' },
      delaySeconds: 5,
    });
  }
}
```

### Recibir y eliminar mensajes manualmente

```typescript
import { Controller, Get } from '@nestjs/common';
import { AwsSqsService, Message } from '@tresdoce-nestjs-toolkit/aws-sqs';

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

> `Message` es el tipo re-exportado desde `@aws-sdk/client-sqs`. Puede usarse para tipar los argumentos de los handlers.

### Consumo automático con el decorador `@AwsSqsMessageHandler`

El decorador `@AwsSqsMessageHandler(queueName)` se coloca sobre un método de un **controller** para registrar un handler
de mensajes. El `AwsSqsListener` descubre automáticamente estos handlers al iniciar el módulo y comienza a hacer polling
a la cola indicada.

**El método decorado debe estar dentro de una clase anotada con `@Controller()`**, ya que el listener escanea únicamente
los controllers registrados en el módulo.

```typescript
import { Controller } from '@nestjs/common';
import { AwsSqsMessageHandler } from '@tresdoce-nestjs-toolkit/aws-sqs';
import { Message } from '@tresdoce-nestjs-toolkit/aws-sqs';

@Controller()
export class OrdersController {
  @AwsSqsMessageHandler('orders')
  async handleOrderMessage(message: Message): Promise<void> {
    console.log(`Received message: ${JSON.stringify(message.Body)}`);
    // Procesamiento del mensaje...
  }
}
```

#### Comportamiento del listener

- El `AwsSqsListener` inicia el polling al arrancar el módulo (`onModuleInit`) y se detiene al destruirlo (`onModuleDestroy`).
- El intervalo entre polls es de **1 segundo**.
- Los mensajes se eliminan de la cola **solo si el handler finaliza sin errores**. Si el handler lanza una excepción,
  el mensaje **no se elimina** y permanece en la cola para ser re-procesado.
- Si la cola especificada no existe en la configuración, se lanza el error: `Error: Queue "<queueName>" not found`.

<a name="instantiation-methods"></a>

### Métodos de instanciamiento

#### Configuración sincrónica (`register`)

Utilizar cuando toda la configuración es conocida en tiempo de arranque.

```typescript
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
import {
  AwsSqsModule,
  AwsSqsModuleOptions,
  AwsSqsModuleOptionsFactory,
} from '@tresdoce-nestjs-toolkit/aws-sqs';
import { Injectable } from '@nestjs/common';

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

### LocalStack

[LocalStack](https://www.localstack.cloud/) permite probar servicios de AWS en un entorno local.

#### Configurar la CLI para LocalStack

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

### `AwsSqsService`

Servicio principal para interactuar con AWS SQS.

#### `sendMessage(options: SendMessageOptions): Promise<void>`

Envía un mensaje a la cola especificada. Si el cuerpo es un objeto, se serializa como JSON.

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
decorada con `@Controller()`.

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

#### `Message`

Tipo re-exportado desde `@aws-sdk/client-sqs`. Úsalo para tipar el parámetro de los handlers de mensajes.

```typescript
import { Message } from '@tresdoce-nestjs-toolkit/aws-sqs';
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
