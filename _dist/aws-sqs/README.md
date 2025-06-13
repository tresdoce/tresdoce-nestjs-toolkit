<div align="center">
  <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
  <h1>Tresdoce NestJS Toolkit<br/>AWS SQS</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.2&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.2.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.3&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
  <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
  <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/aws-sqs.svg">
  <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.19.2 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v11.2.0 or higher
- NestJS v11.1.3 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/aws-sqs
```

```
yarn add @tresdoce-nestjs-toolkit/aws-sqs
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de la configuración de **AWS Simple Queue Service** en `configuration.ts` utilizando el key sqs que obtenga los datos desde las variables de entorno.

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
        //...
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
- Values: `us-east-1`

`endpoint`: Es el contexto de AWS y se utiliza para especificar la URL del servicio al que se quiere conectar.

- Type: `String`
- Values: `https://sqs.us-east-1.amazonaws.com | http://localhost:4566`

#### credentials

Credenciales de la cuenta de AWS

`accessKeyId`: Es el Access Key ID de aws.

- Type: `String`
- Default: `test`

`secretAccessKey`: Es el Secret Access Key de aws.

- Type: `String`
- Default: `test`

`queues`: Es la lista de las colas creadas en AWS SQS, cada item requiere del nombre y la url de la cola.

- Type: `Array`

</details>

<a name="use"></a>

## 👨‍💻 Uso

Importar el `AwsSqsModule` en el archivo `app.module.ts`, y el módulo se encargará de obtener la configuración y realizar la connexion automáticamente.

```typescript
//./src/app.module.ts
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Module({
  //...
  imports: [
    //...
    AwsSqsModule,
    //...
  ],
  //...
})
export class AppModule {}
```

> También es posible configurar el módulo de manera sincrónica y asincrónica utilizando los métodos register, registerAsync, forRoot y forRootAsync.

### Manejo de mensajes

El `AwsSqsService` es el núcleo de la integración con **AWS SQS**. Este servicio proporciona los métodos necesarios para
**enviar**, **recibir** y **eliminar** mensajes de las colas de **SQS**, asegurando una gestión eficiente de los mismos.

#### sendMessage

Envía un mensaje a la cola especificada. Si el cuerpo es un objeto, se serializa como JSON.

| Parameters        | Description                            | Required |
| ----------------- | -------------------------------------- | :------: |
| queueName         | Nombre de la cola                      |   true   |
| messageBody       | Mensaje (puede ser un objeto o string) |   true   |
| delaySeconds      | Retraso en segundos                    |  false   |
| messageAttributes | Atributos adicionales                  |  false   |
| groupId           | ID del grupo para colas FIFO           |  false   |
| deduplicationId   | ID de deduplicación para FIFO          |  false   |

```typescript
import { AwsSqsService } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Injectable()
export class OrdersService {
  constructor(private awsSqsService: AwsSqsService) {}
  //...
  async sendOrder(): Promise<void> {
    await this.awsSqsService.sendMessage({
      queueName: 'orders',
      messageBody: { orderId: 123, product: 'Laptop' },
      delaySeconds: 5,
    });
  }
  //...
}
```

#### receiveMessage

Recibe mensajes de la cola especificada. Devuelve los mensajes recibidos o un array vacío si no hay mensajes.

| Parameters          | Description                             | Required |
| ------------------- | --------------------------------------- | :------: |
| queueName           | Nombre de la cola                       |   true   |
| maxNumberOfMessages | Número máximo de mensajes a recibir.    |   true   |
| waitTimeSeconds     | Tiempo de espera para recibir mensajes. |  false   |

```typescript
import { AwsSqsService } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Controller()
export class OrdersController {
  constructor(private awsSqsService: AwsSqsService) {}
  //...
  @Get('receive-order')
  async receiveOrder(): Promise<any> {
    const messages = await this.sqsService.receiveMessage('orders', 5, 10);
    if (messages.length > 0) {
      messages.forEach((msg) => console.log('Received message:', msg.Body));
      return messages;
    } else {
      console.log('No messages available.');
      return { message: 'No messages available' };
    }
  }
  //...
}
```

#### deleteMessage

Elimina un mensaje utilizando su ReceiptHandle`.

| Parameters    | Description        | Required |
| ------------- | ------------------ | :------: |
| queueName     | Nombre de la cola  |   true   |
| receiptHandle | Handle del mensaje |   true   |

```typescript
import { AwsSqsService } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Controller()
export class OrdersController {
  constructor(private awsSqsService: AwsSqsService) {}
  //...
  @Get('receive-order')
  async receiveOrder(): Promise<any> {
    const messages = await this.awsSqsService.receiveMessage('orders');
    await this.awsSqsService.deleteMessage('orders', messages[0].ReceiptHandle!);
    console.log('Message deleted');
  }
  //...
}
```

### Decorator

Utilizar el decorador `@AwsSqsMessageHandler(<QueueName>)` a nivel endpoint para poder obtener los mensajes de la cola y automatizar procesos.

```typescript
import { AwsSqsMessageHandler } from '@tresdoce-nestjs-toolkit/aws-sqs';
export class Orders {
  //...
  @AwsSqsMessageHandler('orders')
  async handleOrderMessage(message: any) {
    console.log(`Received message: ${JSON.stringify(message)}`);
    // Resto del código para procesar el mensaje
  }
  //...
}
```

## LocalStack

[LocalStack](https://www.localstack.cloud/) es una excelente herramienta para probar servicios de AWS en un entorno local. A continuación, encontrarás una breve guía sobre cómo usar AWS SQS en LocalStack con ejemplos prácticos de comandos.

### Comandos básicos en LocalStack

Asegúrate de tener configurada la CLI de AWS y de usar el **endpoint local** para conectarte a LocalStack.

#### Configurar la CLI para LocalStack:

Para las credenciales de AWS usa como valor test, para la region usa us-east-1 y para la output json.

```
aws configure --profile localstack
```

### Comandos Comunes de SQS

### Crear una Cola

```
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name orders
```

### Listar Colas

```
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

### Enviar un Mensaje a la Cola

```
aws --endpoint-url=http://localhost:4566 sqs send-message --queue-url http://localhost:4566/000000000000/orders --message-body "Order 123: Laptop"
```

### Recibir Mensajes de la Cola

```
aws --endpoint-url=http://localhost:4566 sqs receive-message --queue-url http://localhost:4566/000000000000/orders
```

```
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

### Eliminar un Mensaje de la Cola

```
aws --endpoint-url=http://localhost:4566 sqs delete-message --queue-url http://localhost:4566/000000000000/orders --receipt-handle <receipt-handle>
```

> Reemplaza <receipt-handle> con el valor real devuelto al recibir el mensaje.

```
aws --endpoint-url=http://localhost:4566 sqs delete-message --queue-url http://localhost:4566/000000000000/orders --receipt-handle abc123
```

### Eliminar una Cola

```
aws --endpoint-url=http://localhost:4566 sqs delete-queue --queue-url http://localhost:4566/000000000000/orders
```

### Métodos de instanciamiento

#### Configuración Sincrónica (register)

Usa este método cuando tienes la configuración del módulo lista al momento de inicializar la aplicación.

```typescript
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Module({
  //...
  imports: [
    //...
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
    //...
  ],
  //...
})
export class AppModule {}
```

#### Descripción

- Se utiliza cuando toda la configuración es conocida de antemano.
- Los parámetros como **region**, **endpoint**, **credentials** y las **colas** se pasan directamente en el momento de la configuración.

#### Configuración Asíncronica (registerAsync)

Usa este método si necesitas cargar configuraciones de forma asíncrona, por ejemplo, desde un servicio de configuración.

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Module({
  //...
  imports: [
    //...
    AwsSqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('config.sqs'),
      inject: [ConfigService],
    }),
    //...
  ],
  //...
})
export class AppModule {}
```

#### Descripción

- Ideal para entornos complejos donde los valores se cargan de un servicio como `ConfigService`.
- El uso de `useFactory` permite inicializar la configuración de manera asíncrona.

#### Configuración Global Sincrónica (forRoot)

Este método hace que el módulo esté disponible en toda la aplicación sin necesidad de importarlo explícitamente en cada módulo.

```typescript
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Module({
  //...
  imports: [
    //...
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
    //...
  ],
  //...
})
export class AppModule {}
```

#### Descripción

- Este método expone el módulo de manera global para que no sea necesario importarlo en cada módulo donde se necesite.
- Útil para aplicaciones con múltiples módulos que requieren acceso a **AWS SQS**.

#### Configuración Global Asíncronica (forRootAsync)

Usa este método si deseas que el módulo sea global, pero necesitas cargar la configuración de manera asíncrona.

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsSqsModule } from '@tresdoce-nestjs-toolkit/aws-sqs';
@Module({
  //...
  imports: [
    //...
    AwsSqsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('config.sqs'),
      inject: [ConfigService],
    }),
    //...
  ],
  //...
})
export class AppModule {}
```

#### Descripción

- Global y Asíncrona: El módulo estará disponible en toda la aplicación y cargará la configuración de forma asíncrona.
- Recomendado cuando la configuración depende de variables de entorno o servicios externos.

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
  <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
    <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
  </a><br/>
  <p>Made with ❤</p>
</div>
