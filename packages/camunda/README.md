<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Camunda</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.2.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/camunda.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://rudemex-nestjs-starter.herokuapp.com/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v8.2.6 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/camunda
```

```
yarn add @tresdoce-nestjs-toolkit/camunda
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a Camunda en `configuration.ts` utilizando el key `camunda` y que contenga el
objeto con los datos conexión desde las variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
//import { logger } from '@tresdoce-nestjs-toolkit/camunda';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    camunda: {
      baseUrl: process.env.CAMUNDA_URL_REST || 'http://localhost:8080/engine-rest',
      //use: logger,
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`baseUrl`: Ruta de acceso a la API de Camunda.

- Type: `String`
- Required: `true`

`workerId`: Es el ID del worker en el que se obtienen las tareas, las tareas devueltas están bloqueadas para ese worker
y solo pueden completarse si se proporciona el mismo workerId.

- Type: `String`
- Required: `false`
- Default: `some-random-id`

`maxTasks`: Es el número máximo de tareas a recuperar.

- Type: `Number`
- Required: `false`
- Default: `10`

`maxParallelExecutions`: Es el número máximo de tareas en las que se puede trabajar simultáneamente.

- Type: `Number`
- Required: `false`

`interval`: Es el intervalo de tiempo para esperar antes de hacer un nuevo sondeo.

- Type: `Number`
- Required: `false`
- Default: `300`

`lockDuration`: Es la duración por defecto para bloquear las tareas externas en milisegundos.

- Type: `Number`
- Required: `false`
- Default: `50000`

`autoPoll`: Si es verdadero, el sondeo se inicia automáticamente en cuanto se crea una instancia de Cliente.

- Type: `Boolean`
- Required: `false`
- Default: `true`

`asyncResponseTimeout`: Ee el tiempo de espera del sondeo largo en milisegundos.

- Type: `Number`
- Required: `false`

`usePriority`: Si es falso, la tarea será obtenida arbitrariamente en lugar de basarse en su prioridad.

- Type: `Boolean`
- Required: `false`
- Default: `true`

`interceptors`: Función(es) que será(n) llamada(s) antes de que se envíe una solicitud. Los interceptores reciben la
configuración de la solicitud y devuelven una nueva configuración.

- Type: `Funtion | [Function]`
- Required: `false`

`use`: Función(es) que tiene(n) acceso a la instancia del cliente tan pronto como se crea y antes de que ocurra
cualquier sondeo. Consulta el [logger](https://github.com/camunda/camunda-external-task-client-js/blob/master/docs/logger.md) para entender mejor el uso de los middlewares.

- Type: `Funtion | [Function]`
- Required: `false`

Para más información sobre los parámetros de conexión, puedes consultar en
la [Documentación](https://github.com/camunda/camunda-external-task-client-js/blob/master/docs/Client.md#new-clientoptions)
de Camunda.

</details>

<a name="use"></a>

## 👨‍💻 Uso

Primero hay que instanciar el `CamundaTaskConnector` como **microservice** en la inicialización de nuestra aplicación.

```typescript
//./src/main.ts
//...
import { CamundaTaskConnector } from '@tresdoce-nestjs-toolkit/camunda';

async function bootstrap() {
  //...
  app.connectMicroservice({
    strategy: app.get(CamundaTaskConnector),
  });
  await app.startAllMicroservices();
  //..
}
bootstrap();
```

Luego hay que instanciar el módulo de camunda.

```typescript
//./src/app.module.ts
//...
import { CamundaModule } from '@tresdoce-nestjs-toolkit/camunda';

@Module({
  imports: [
    //...
    CamundaModule,
    //...
  ],
  //...
})
export class AppModule {}
```

El siguiente fragmento de código está basado parcialmente en el proceso bpmn de los [ejemplos de Camunda](https://github.com/camunda/camunda-external-task-client-js/tree/master/examples/order).

```typescript
//./src/app.controller.ts
//...
import { Ctx, Payload } from '@nestjs/microservices';
import {
  Subscription,
  HandleFailureOptions,
  Task,
  TaskService,
  Variables,
  logger,
} from '@tresdoce-nestjs-toolkit/camunda';

@Controller()
export class AppController {
  //...

  @Subscription('invoiceCreator', {
    lockDuration: 500,
  })
  async myExternalTask(@Payload() task: Task, @Ctx() taskService: TaskService) {
    //console.log(task);

    // Put your business logic
    // complete the task
    const date = new Date();
    const minute = date.getMinutes();
    const businessKey = task.businessKey;
    const isBusinessKeyMissing = !businessKey;
    const processVariables = new Variables();

    processVariables.setAll({ date });

    if (!isBusinessKeyMissing) {
      // check if minute is even
      if (minute % 2 === 0) {
        // for even minutes, store variables in the process scope
        await taskService.complete(task, processVariables);
      } else {
        // for odd minutes, store variables in the task local scope
        await taskService.complete(task, null, processVariables);
      }
      logger.success(`completed task ${task.id}`, 'Camunda');
    } else {
      const errorMessage = 'No business key given!';
      const options: HandleFailureOptions = {
        errorMessage: errorMessage,
      };

      // Raise an incident
      await taskService.handleFailure(task, options);

      logger.error(errorMessage);
    }
  }
  //...
}
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="../../.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
