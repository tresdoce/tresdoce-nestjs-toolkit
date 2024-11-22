<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Core</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.18.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v10.9.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.4.8&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/core.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.18.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.19 or higher
- NPM v10.9.0 or higher
- NestJS v10.4.8 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/core
```

```
yarn add @tresdoce-nestjs-toolkit/core
```

<a name="use"></a>

## 👨‍💻 Uso

### Validation Schema

La validación del los parámetros (`envs`) que requiere la aplicación son validados por medio de la función
`validateSchemaForApp`, esta tienen integrado la validación los schemas obligatorios y base para la app.

#### ValidationSchema for App

```typescript
// ./src/config/validationSchema.ts
import Joi from 'joi';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  // Custom parameters
  TEST_KEY: Joi.string().optional(),
  RICK_AND_MORTY_API_URL: Joi.string().required(),
  RICK_AND_MORTY_API_URL_LIVENESS: Joi.string().required(),
});
```

### corePathsExcludes

Es una variable que contiene una lista de `paths` con sus `methods` con el fin de ser excluidos tanto del `prefix` de la
app, como asi también de otras funcionalidades para que no generen registros innecesarios, como puede ser el caso de
los `logs`con los endpoints del `helath`.

```typescript
// ./src/main.ts
import { corePathsExcludes } from '@tresdoce-nestjs-toolkit/core';

async function bootstrap() {
  //...
  app.setGlobalPrefix(`${server.context}`, {
    exclude: [...corePathsExcludes()],
  });
  //...
}
```

### setHttpsOptions

Para implementar `SSL` en la app, se requiere tener la ruta del `cert`y la `privKey` para poder instanciarlo en los
options.

```typescript
// ./src/main.ts
import { setHttpsOptions } from '@tresdoce-nestjs-toolkit/core';

const certPath = './path/to/secrets/public-certificate.pem';
const pkeyPath = './path/to/secrets/private-key.pem';

async function bootstrap() {
  //...
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      httpsOptions: setHttpsOptions(certPath, pkeyPath),
    });
  }
  //...
}
```

## Cross-site request forgery (CSRF)

Cross-Site Request Forgery (**CSRF**) es un tipo de ataque de seguridad que ocurre cuando un atacante engaña a un usuario
autenticado para que realice acciones no deseadas en una aplicación web en la que está autenticado. En un ataque **CSRF**,
el atacante aprovecha la confianza que una aplicación web tiene en el navegador del usuario.

El uso de este middleware de protección **CSRF** es importante para la seguridad de las aplicaciones, ya que es una capa
de seguridad extra que previene ataques de Cross-Site Request Forgery asegurándose de que cada solicitud sea legítima y
autorizada por el usuario. Mediante la generación y validación de tokens **CSRF** únicos asociados con la sesión del
usuario, que se incluyen en solicitudes posteriores, el middleware verifica la presencia y validez del token en cada solicitud.
Si el token no está presente o es inválido, la solicitud se rechaza, protegiendo así tanto a los usuarios como a la
aplicación de acciones maliciosas.

### Configuración

El **CSRF** funciona utilizando cookies, por lo cual se pueden realizar diversas configuraciones por medio de la
configuración centralizada de la app, ya que esta permite utilizar variables de entorno para realizar ajustes de manera
inmediata sin tener que re-desplegar la aplicación.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      csrf: {
        secret: process.env.CSRF_SECRET, // Usar CSRF_SECRET como env
        // otras propiedades de las cookies
      },
    },
    //...
  };
});
```

Agregar en el `validationSchema.ts` las validaciones para el **CSRF**.

```typescript
//./src/config/validationSchema.ts
//...
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  //...
  ...validationSchemaCsrf,
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`key`: Es la clave utilizada para almacenar el secret del token CSRF en las cookies.

- Type: `String`
- Default: `_csrf`
- Example: `csrf_key`

`cookieName`: Es el nombre del token CSRF que se envía en los request para validar la petición.

- Type: `String`
- Default: `xsrf-token`
- Example: `token-xsrf`

`secret`: Es la frase secreta utilizada para firmar el token CSRF. Se utiliza para validar la integridad del token.

- Type: `String`
- Default: `''`
- Example: `9r@F5z!X8w*L3q&H2s^J7p#K1n$Y4m?A`

`sameSite`: Define el atributo SameSite para la cookie CSRF, que controla cuándo se envía la cookie en las solicitudes entre sitios.

- Type: `String`
- Values: `strict | lax | none`
- Default: `strict`
- Example: `lax`

`httpOnly`: Especifica si la cookie CSRF debe ser accesible solo a través del protocolo HTTP y no a través de JavaScript.

- Type: `Boolean`
- Values: `true | false`
- Default: `true`
- Example: `false`

`signed`: Indica si la cookie CSRF debe estar firmada con la frase secreta.

- Type: `Boolean`
- Values: `true | false`
- Default: `true`
- Example: `false`

`path`: Especifica la ruta para la que es válida la cookie CSRF.

- Type: `String`
- Default: `/`
- Example: `/v1/api-context`

`secure`: Indica si la cookie CSRF debe ser enviada solo a través de conexiones seguras (HTTPS).
Desde el middleware realiza una validación booleana de sí el NODE_ENV es `production`, de esta manera se configura
automáticamente en `true` si estás en algún entorno o `false` si estás en desarrollo local o en modo `test`.

- Type: `Boolean`
- Values: `true | false`
- Default: `false`
- Example: `true`

`maxAge`: Especifica el tiempo máximo de vida de la cookie CSRF en segundos.

- Type: `Number`
- Default: `300` (5 minutos)
- Example: `600` (10 minutos)

</details>

### Tips de configuración

Para garantizar una buena seguridad para las cookies de **CSRF Token**, es recomendable tener las siguientes configuraciones,
teniendo en cuenta que algunas ya vienen configuradas desde el middleware y cualquier cambio que se haga, será bajo la
responsabilidad del equipo.

- **Secure**: Establecer `secure: true` garantiza que la cookie solo se envíe a través de conexiones HTTPS, protegiendo la
  cookie de ser interceptada por ataques de intermediarios.
- **HttpOnly**: Configurar `httpOnly: true` impide que la cookie sea accesible a través de JavaScript en el navegador,
  reduciendo el riesgo de ataques de secuencias de comandos entre sitios (XSS).
- **SameSite**: Establecer `sameSite: 'strict'` asegura que la cookie solo se envíe en solicitudes del mismo sitio,
  protegiendo contra ataques **CSRF**. En algunos casos, si necesitas permitir solicitudes entre sitios, puedes usar
  `sameSite: 'lax'`, pero `strict proporciona una mayor seguridad.
- **MaxAge**: Configurar un maxAge razonablemente corto limita el tiempo durante el cual la cookie es válida.
  Por ejemplo, `maxAge: 300` (5 minutos) es una duración común para tokens de autenticación o **CSRF**.
- **Path**: Establecer `path: '/'` asegura que la cookie sea válida para toda la aplicación. Esto puede ser ajustado
  según la estructura y necesidades de tu aplicación.
- **Signed**: Configurar `signed: true` indica que la cookie está firmada con la frase secreta, lo que añade una capa
  adicional de seguridad verificando la integridad de la cookie.
- **Secret**: El secret es una frase secreta utilizada para firmar la cookie. Debe ser una cadena compleja y única.

### Implementación del middleware

Si bien la app viene con ciertas configuraciones de middlewares, para hacer uso del **CSRF Token** requiere ser
configurado en el `main.ts` utilizando la configuración centralizada, y ajustando el middleware del `cookieParser`.

```typescript
//.src/maint.ts
//...
import {
  //...
  csrfToken,
} from '@tresdoce-nestjs-toolkit/core';

async function bootstrap() {
  //...
  const appConfig = app.get<ConfigService>(ConfigService)['internalConfig']['config'];
  //...
  app.use([
    cookieParser(appConfig.server.csrf.secret),
    csrfToken(appConfig.server.csrf),
    //...
  ]);
  //...
}
(async () => await bootstrap())();
```

Para poder proteger el o los endpoints utilizando las validaciones del **CSRF Token**, se tiene que implementar el
decorador `@Csrf()` a nivel endpoint o a nivel controller, de esta manera se aplica un **guard** que es el encargado de
validar los tokens de las cookies antes de llegar a ejecutar el controlador, si los tokens son válidos el **guard**
permitirá la ejecución del controller, en caso contrario, retornará una exception indicando el tipo de error.

#### Nivel controller

Impacta a todos los endpoints del controller

```typescript
//...
import { Csrf } from '@tresdoce-nestjs-toolkit/paas';

@Csrf()
export class MyController {
  //...
  @Get()
  async myEndpoint() {
    //....
  }

  @Get('endpoint2')
  async myEndpoint2() {
    //....
  }

  @Get('endpointN')
  async myEndpointN() {
    //....
  }
  //...
}
```

#### Nivel endpoint

Impacta a un endpoint del controller

```typescript
//...
import { Csrf } from '@tresdoce-nestjs-toolkit/paas';

export class MyController {
  //...
  @Get()
  @Csrf()
  async myEndpoint() {
    //....
  }
  //...
}
```

### Iniciar el CSRF Token de sesión

Para que tengan sentido la implementación de los **CSRF Tokens** y funcione correctamente, se requiere configurar el
primer token que corresponde a la sesión, a partir de ahi, cada request que se realice, se configurara un token que va
a ir cambiando automáticamente entre requests.

Para setear este primer token, se requiere analizar la aplicación y evaluar en que endpoint es conveniente implementarlo,
esto se debe a que si tu aplicación tiene un endpoint que carga contenido no sensible para la app (es decir un endpoint
público), se podría implementar en este punto, o bien, si tu app tiene un endpoint de `login` es recomendable hacerlo
en este punto de entrada.

```typescript
//...
import { ICsrfRequest } from '@tresdoce-nestjs-toolkit/paas';

export class AuthController {
  //...
  @Get('/login')
  async login(@Req() req: ICsrfRequest) {
    // Genera el token de sesion
    req.csrfToken();
    //....
  }
  //...
}
```

### Consideraciones

Algunas consideraciones a tener en cuenta al momento de desarrollar y desplegar la app en algún entorno.

- En las variables de entorno de la app, hay que agregar en la lista de `ALLOWED_HEADERS` el valor `Access-Control-Allow-Credentials`.
- En las variables de entorno de la app, hay que configurar `CORS_CREDENTIALS` con el valor `true`.
- Si estás utilizando `Axios` en el front o en el back, es importante que configures las peticiones de la instancia con
  la propiedad `withCredentials` en `true`.
- Como esta funcionalidad hace uso de las `Cookies`, revisar que el navegador/herramientas que uses cuente con la
  configuración correcta y se puedan configurar los tokens adecuadamente.

## Decorators

### Public

Decorador para definir si un endpoint es público.

```typescript
// ./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Publico
  @Get('')
  @Public()
  getTestEnv(): string {
    return this.appService.getTestEnv();
  }

  // Privado
  @Get('my-util')
  getMyUtil() {
    return this.appService.getMyCustomUtil();
  }
}
```

### Roles

Decorador para definir el metadata de roles.

```typescript
// ./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Only user role
  @Get('')
  @Roles('user')
  getTestEnv(): string {
    return this.appService.getTestEnv();
  }

  // Only user and admin role
  @Get('my-util')
  @Roles('user', 'admin')
  getMyUtil() {
    return this.appService.getMyCustomUtil();
  }
}
```

## Param Decorators

### Pagination

Decorador para manejar la paginación.

```typescript
// ./src/users/controllers/users.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Pagination, PaginationParamsDto } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class UsersController {
  //...

  @Get()
  findAll(@Pagination() pagination: PaginationParamsDto) {
    const { page, size } = pagination;
    console.log('Current page: ', page);
    console.log('Items per page: ', size);
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`page`: El número de la página actual, proporciona un punto de referencia claro para el usuario.

- Type: `number`
- Default: `1`
- Example: `3`

`size`: El número de elementos por página, este puede ser un valor predeterminado o especificado por el usuario con un
valor máximo de 100 items por repuesta.

- Type: `number`
- Default: `20`
- Example: `10`

</details>

#### URL Example

- Schema: `<http|https>://<server_url><:port>/<app-context>/<endpoint-path>?page=<value-page>&size=<value-size>`
- Example: `http://localhost:8080/v1/users?page=2&size=20`

### Sorting

Decorador para manejar el ordenamiento de los resultados.

```typescript
// ./src/users/controllers/users.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Sorting, SortingParamsDto } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class UsersController {
  //...

  @Get()
  findAll(@Sorting(['id', 'email']) sorting: SortingParamsDto) {
    const { fields } = sorting;
    console.log('Sorting Fields: ', fields);
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`field`: El nombre del campo por el cual se ordenará.

- Type: `string`
- Example: `'id', 'email'`

`order`: La dirección del ordenamiento, puede ser ascendente (`asc`) o descendente (`desc`).

- Type: `asc | desc`
- Default: `asc`
- Example: `desc`

</details>

#### URL Example

- Schema: `<http|https>://<server_url><:port>/<app-context>/<endpoint-path>?sort=<field1>:<order1>,<field2>:<order2>,...`
- Example: `http://localhost:8080/v1/items?sort=id:asc,email:desc`

### Filtering

Decorador para manejar el filtrado de los resultados basado en varios criterios.

```typescript
// ./src/users/controllers/users.controller.ts
import { Controller, Get } from '@nestjs/common';
import { FilteringParams, FilteringParamsDto } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class UsersController {
  //...

  @Get()
  findAll(@FilteringParams(['firstName', 'email', 'id']) filters: FilteringParamsDto) {
    filters.forEach((filter) => {
      console.log('Filter Property: ', filter.property);
      console.log('Filter Rule: ', filter.rule);
      console.log('Filter Values: ', filter.values);
    });
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`property`: El nombre de la propiedad por la cual se filtra.

- Type: `string`
- Example: `'firstName', 'id'`

`rule`: La regla utilizada para filtrar, determina cómo se compara el valor de la propiedad.

- Type: `FilterRule`
- Enum: `eq | neq | gt | gte | lt | lte | like | nlike | in | nin | isnull | isnotnull`
- Example: `gte`

`values`: Los valores utilizados para el filtro según la regla.

- Type: `string[] | number[] | boolean[]`
- Example ('gt', 'gte', 'lt', 'lte'): `[30]`
- Example ('in', 'nin'): `['John', 'Doe']`

</details>

#### URL Example

- Schema: `<http|https>://<server_url><:port>/<app-context>/<endpoint-path>?filter=<property1>:<rule1>:<value1>,<property2>:<rule2>:<value2>,<value22>,...`
- Example: `http://localhost:8080/v1/users?filter=age:gte:30,name:like:John,status:in:active,inactive`

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
