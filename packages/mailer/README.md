<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Mailer</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/mailer.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Es un wrapper de [Nodemailer](https://nodemailer.com/) para NestJS que expone un `MailerService` inyectable para enviar
emails por SMTP (u otro transporte de Nodemailer), con soporte para **múltiples transportadores**, **templates**
(Handlebars, EJS y Pug) e **inline de CSS** automático con [`@css-inline/css-inline`](https://github.com/Stranger6667/css-inline).

Usalo cuando tu aplicación necesite enviar emails transaccionales (bienvenida, recupero de contraseña, notificaciones,
reportes) leyendo la configuración SMTP desde la config centralizada.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [🐳 SMTP local con Docker](#docker)
- [👨‍💻 Uso](#use)
- [📨 Respuestas y errores](#responses)
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
- Proyecto ESM (`"type": "module"`): el paquete se publica sólo como ES Module.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/mailer
```

```
yarn add @tresdoce-nestjs-toolkit/mailer
```

Los motores de templates (`handlebars`, `ejs`, `pug`), `nodemailer` y `@css-inline/css-inline` vienen incluidos como
dependencias del paquete.

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

El `MailerModule` lee sus opciones desde `ConfigService` con la key **`config.mailer`** (propiedad `mailer` de
`Typings.AppConfig`, de tipo `MailerOptions`). Agregá los datos de conexión SMTP en `configuration.ts` tomando los valores
de las variables de entorno.

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import path from 'node:path';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { HandlebarsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    mailer: {
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para 587/1025 (STARTTLS)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      },
      // Opcional: configuración de templates
      template: {
        dir: path.join(import.meta.dirname, '../templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    },
    //...
  };
});
```

Variables de entorno de ejemplo (`.env`):

```dotenv
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@my-app.com
EMAIL_FROM_NAME=My App
```

Las variables pueden validarse con Zod en el `ConfigModule` del starter:

```typescript
import { z } from 'zod';
import {
  validateSchemaForApp,
  zBooleanFromEnv,
  zNumberFromEnv,
} from '@tresdoce-nestjs-toolkit/paas';

ConfigModule.forRoot({
  isGlobal: true,
  load: [config],
  validationSchema: validateSchemaForApp({
    EMAIL_HOST: z.string(),
    EMAIL_PORT: zNumberFromEnv(),
    EMAIL_SECURE: zBooleanFromEnv().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.email(),
  }),
});
```

> Los templates (`.hbs`, `.ejs`, `.pug`) no son TypeScript: asegurate de copiarlos al build (por ejemplo con `assets` en
> `nest-cli.json`) y de que `template.dir` apunte a la carpeta correcta en runtime (usando `import.meta.dirname`).

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`transport`: Transporte único. Puede ser un objeto de opciones de Nodemailer, una URL de conexión
(`smtps://user%40domain.com:pass@smtp.domain.com`) o una instancia de transporte (por ejemplo `new SMTPTransport({...})`).

- Type: `TransportType`
- Required: `true` (a menos que se use `transports`)

`transport.host` / `transport.port`: Servidor y puerto SMTP. Si no se define, Nodemailer usa el puerto `587` (o `465` si
`secure: true`).

`transport.secure`: Conexión TLS directa. Default de Nodemailer: `false` (usa STARTTLS si el servidor lo soporta).

`transport.requireTLS`: Obliga a usar STARTTLS cuando `secure` es `false`.

> **Nota:** `defaultTransportOptions` (`{ secure: true, requireTLS: true }`) es una constante exportada para que la
> combines vos (`{ ...defaultTransportOptions, host, port, auth }`); el módulo **no** la aplica automáticamente.

`transport.auth.user` / `transport.auth.pass`: Credenciales SMTP.

`transports`: Transportadores con nombre, para enviar desde distintas cuentas o proveedores.

- Type: `{ [name: string]: SMTPTransport | SMTPTransport.Options | string }`

`defaults`: Opciones aplicadas a todos los envíos (por ejemplo `from`).

`template.dir`: Directorio base para resolver los templates relativos (`template: './welcome'`). Si un template se pasa
con ruta absoluta, se ignora.

`template.adapter`: Adaptador a usar: `HandlebarsAdapter`, `EjsAdapter`, `PugAdapter` o uno propio que implemente
`TemplateAdapter`.

`template.options`: Opciones que se pasan al motor:

- Handlebars: opciones de `handlebars.compile` (ej. `{ strict: true }`).
- EJS: opciones de `ejs.compile` (ej. `{ async: true }`).
- Pug: opciones/locals de `pug.renderFile` (se mezclan con el `context`).

`options`: Opciones de runtime de Handlebars (`data`, `helpers`, etc.) que se pasan al ejecutar el template.

`options.partials.dir`: Directorio de partials de Handlebars. Se registran todos los `*.hbs` (recursivo) con su ruta
relativa como nombre (`partials/footer.hbs` → `{{> partials/footer}}`). También quedan disponibles por nombre de archivo
(`{{> footer}}`).

`options.partials.options`: Opciones de `handlebars.compile` para los partials.

</details>

<a name="docker"></a>

## 🐳 SMTP local con Docker

Para desarrollo no envíes mails reales: levantá [Mailpit](https://mailpit.axllent.org/), un SMTP de pruebas que captura
los emails y los muestra en una UI web.

```yaml
# ./docker-compose.yml
services:
  mailpit:
    image: axllent/mailpit:v1.32.0
    container_name: mailpit
    restart: unless-stopped
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # UI web -> http://localhost:8025
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
```

```bash
docker compose up -d mailpit
```

Con las variables de entorno del ejemplo (`EMAIL_HOST=localhost`, `EMAIL_PORT=1025`, `EMAIL_SECURE=false`) los mails
enviados aparecen en `http://localhost:8025`.

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo (configuración centralizada)

Importar el `MailerModule` en el `app.module.ts`. Es `@Global()`, así que alcanza con importarlo una sola vez; toma la
configuración de `config.mailer`.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@tresdoce-nestjs-toolkit/mailer';

import config from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), MailerModule],
})
export class AppModule {}
```

### Importación estática con `forRoot`

Sin configuración centralizada (o en tests), se puede pasar las opciones directamente:

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@tresdoce-nestjs-toolkit/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: 'smtp://localhost:1025',
      defaults: {
        from: '"My App" <noreply@my-app.com>',
      },
    }),
  ],
})
export class AppModule {}
```

### Envío de email simple

```typescript
//./src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@tresdoce-nestjs-toolkit/mailer';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcome(email: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenido',
      text: 'Gracias por registrarte',
      html: '<b>Gracias por registrarte</b>',
    });
  }
}
```

Si el mail ya trae `html`, el adaptador de templates no se ejecuta.

### Templates de email

El `template` puede ser relativo a `template.dir` o una ruta absoluta; si no tiene extensión se agrega la del adaptador
(`.hbs`, `.ejs` o `.pug`). Los templates compilados se cachean en memoria por ruta absoluta (por instancia del
adaptador), así que el archivo se lee una sola vez.

#### Handlebars

```typescript
//./src/config/configuration.ts
import path from 'node:path';
import { HandlebarsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

const templatesDir = path.join(import.meta.dirname, '../templates');

// dentro de registerAs('config', ...)
mailer: {
  transport: { /* ... */ },
  template: {
    dir: templatesDir,
    // helpers propios (opcional); el helper `concat` viene registrado por defecto
    adapter: new HandlebarsAdapter({
      upper: (value: string) => value.toUpperCase(),
    }),
    options: { strict: true },
  },
  options: {
    partials: { dir: path.join(templatesDir, 'partials') },
  },
},
```

Template (`templates/welcome.hbs`):

```handlebars
<p>Hola {{upper name}},</p>
<p>{{concat "Bienvenido a " appName}}</p>
{{> footer}}
```

```typescript
await this.mailerService.sendMail({
  to: email,
  subject: 'Bienvenido',
  template: './welcome',
  context: { name: 'Juan', appName: 'My App' },
});
```

#### EJS

```typescript
import { EjsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

mailer: {
  transport: { /* ... */ },
  template: {
    dir: templatesDir,
    adapter: new EjsAdapter(),
    options: { async: false }, // con `async: true` se soportan `await` dentro del template
  },
},
```

Template (`templates/welcome.ejs`):

```html
<p>Hola <%= name %>,</p>
<p>Bienvenido a NestJS Mailer.</p>
```

#### Pug

```typescript
import { PugAdapter } from '@tresdoce-nestjs-toolkit/mailer';

mailer: {
  transport: { /* ... */ },
  template: {
    dir: templatesDir,
    adapter: new PugAdapter(),
  },
},
```

Template (`templates/welcome.pug`):

```pug
p Hola #{name},
p Bienvenido a NestJS Mailer.
```

El envío es igual para los tres adaptadores (`template` + `context`).

### CSS Inline

Todos los adaptadores aplican inline de CSS **por defecto** (`inlineCssEnabled: true`): los `<style>` se convierten en
atributos `style` y el resultado se envuelve en un documento HTML completo. Cada instancia tiene su propia configuración.

```typescript
// deshabilitado: el HTML se envía tal cual lo genera el template
new HandlebarsAdapter(undefined, { inlineCssEnabled: false });

// con opciones de @css-inline/css-inline (ej. conservar media queries)
new EjsAdapter({
  inlineCssEnabled: true,
  inlineCssOptions: { keepStyleTags: true },
});
```

Ejemplo, con el template `<p>Hola {{name}}</p>` y `context: { name: 'Juan' }`:

```html
<!-- inlineCssEnabled: true (default) -->
<html>
  <head></head>
  <body>
    <p>Hola Juan</p>
  </body>
</html>

<!-- inlineCssEnabled: false -->
<p>Hola Juan</p>
```

### Múltiples transportadores

```typescript
mailer: {
  transports: {
    primary: {
      host: process.env.EMAIL_HOST_PRIMARY,
      port: 587,
      auth: { user: process.env.EMAIL_USER_PRIMARY, pass: process.env.EMAIL_PASS_PRIMARY },
    },
    secondary: 'smtps://user2%40domain.com:pass2@smtp.domain.com',
  },
  defaults: { from: '"My App" <noreply@my-app.com>' },
},
```

Se elige el transportador con `transporterName` (se puede combinar con `transport`, que se usa cuando no se indica
nombre):

```typescript
await this.mailerService.sendMail({
  to: 'destinatario@email.com',
  subject: 'Asunto',
  text: 'Mensaje',
  transporterName: 'secondary',
});
```

### Transport factory personalizada

El `MailerService` acepta un provider opcional `MAILER_TRANSPORT_FACTORY` para crear los transportes (útil en tests o
para instrumentar Nodemailer):

```typescript
import { Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import {
  MAILER_OPTIONS,
  MAILER_TRANSPORT_FACTORY,
  MailerService,
  type MailerTransportFactory,
  type TransportType,
} from '@tresdoce-nestjs-toolkit/mailer';

class JsonTransportFactory implements MailerTransportFactory {
  createTransport(_opts?: TransportType) {
    return createTransport({ jsonTransport: true });
  }
}

@Module({
  providers: [
    { provide: MAILER_OPTIONS, useValue: { transport: { jsonTransport: true } } },
    { provide: MAILER_TRANSPORT_FACTORY, useClass: JsonTransportFactory },
    MailerService,
  ],
  exports: [MailerService],
})
export class TestMailerModule {}
```

<a name="responses"></a>

## 📨 Respuestas y errores

`sendMail` devuelve el `SentMessageInfo` de Nodemailer. Con un transporte SMTP:

```json
{
  "accepted": ["destinatario@email.com"],
  "rejected": [],
  "ehlo": ["PIPELINING", "8BITMIME", "SMTPUTF8", "AUTH LOGIN PLAIN"],
  "envelopeTime": 4,
  "messageTime": 6,
  "messageSize": 589,
  "response": "250 2.0.0 Ok: queued as QpA9tG6Xn3vyUZ6Ccj2uFJ",
  "envelope": {
    "from": "noreply@my-app.com",
    "to": ["destinatario@email.com"]
  },
  "messageId": "<5d0b3a52-61d3-0a4b-7a3c-0a6f6c2b1d1e@my-app.com>"
}
```

Errores posibles:

| Situación                                                    | Error                                                                                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| No hay `transport` ni `transports` (o falta `config.mailer`) | `Error: Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.` (al iniciar la app) |
| `transporterName` inexistente                                | `ReferenceError: Transporters object doesn't have <name> key`                                                                                 |
| Sin `transporterName` y sin `transport`                      | `ReferenceError: Transporter object undefined`                                                                                                |
| Template inexistente                                         | `Error: ENOENT: no such file or directory, open '<ruta>.hbs'` (la promesa de `sendMail` se rechaza)                                           |
| Error de render (ej. variable faltante con `strict: true`)   | El error del motor de templates (ej. `"name" not defined in [object Object]`)                                                                 |
| Error de inline CSS                                          | El error de `@css-inline/css-inline` (ej. `Missing stylesheet file: /styles.css`)                                                             |

<a name="api-reference"></a>

## 📖 API Reference

### `MailerModule`

| Método                                          | Descripción                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MailerModule` (sin argumentos)                 | Lee la configuración de `ConfigService` (key `config.mailer`). `@Global()`. Requiere `ConfigModule` global. |
| `MailerModule.forRoot(options?: MailerOptions)` | Inicialización estática con opciones directas (módulo global).                                              |

### `MailerService`

| Método                                                          | Descripción                                                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `sendMail(options: ISendMailOptions): Promise<SentMessageInfo>` | Envía un email. Con `options.transporterName` usa ese transportador de `transports`; si no, el `transport` único. |

### `ISendMailOptions`

Extiende `SendMailOptions` de Nodemailer.

| Campo             | Tipo                                       | Descripción                                          |
| ----------------- | ------------------------------------------ | ---------------------------------------------------- |
| `to`              | `EmailAddress`                             | Destinatario(s)                                      |
| `cc`              | `EmailAddress`                             | Copia(s)                                             |
| `bcc`             | `EmailAddress`                             | Copia(s) oculta(s)                                   |
| `from`            | `string \| Address`                        | Remitente                                            |
| `replyTo`         | `string \| Address`                        | Dirección de respuesta                               |
| `inReplyTo`       | `string \| Address`                        | En respuesta a                                       |
| `subject`         | `string`                                   | Asunto                                               |
| `text`            | `string \| Buffer \| AttachmentLikeObject` | Cuerpo en texto plano                                |
| `html`            | `string \| Buffer`                         | Cuerpo en HTML (si está, no se renderiza `template`) |
| `sender`          | `string \| Address`                        | Header `Sender`                                      |
| `raw`             | `string \| Buffer`                         | Mensaje RFC822 crudo                                 |
| `textEncoding`    | `TextEncoding`                             | `'quoted-printable' \| 'base64'`                     |
| `references`      | `string \| string[]`                       | Referencias de mensajes anteriores                   |
| `encoding`        | `string`                                   | Codificación del mensaje                             |
| `date`            | `Date \| string`                           | Fecha del mensaje                                    |
| `headers`         | `Headers`                                  | Headers adicionales                                  |
| `attachments`     | `{ filename, content?, path?, ... }[]`     | Adjuntos                                             |
| `dkim`            | `DKIM.Options`                             | Firma DKIM                                           |
| `template`        | `string`                                   | Template a renderizar                                |
| `context`         | `{ [name: string]: any }`                  | Variables del template                               |
| `transporterName` | `string`                                   | Nombre del transportador de `transports`             |

### `MailerOptions`

| Campo              | Tipo                                                                   | Descripción                                  |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------------------- |
| `transport`        | `TransportType`                                                        | Transporte único                             |
| `transports`       | `{ [name: string]: SMTPTransport \| SMTPTransport.Options \| string }` | Transportadores con nombre                   |
| `defaults`         | `Options`                                                              | Opciones por defecto para todos los envíos   |
| `template.dir`     | `string`                                                               | Directorio base de templates                 |
| `template.adapter` | `TemplateAdapter`                                                      | Adaptador de templates                       |
| `template.options` | `{ [name: string]: any }`                                              | Opciones del motor de templates              |
| `options`          | `{ [name: string]: any }`                                              | Opciones de runtime de Handlebars / partials |

### `TemplateAdapterConfig`

| Campo              | Tipo      | Default | Descripción                          |
| ------------------ | --------- | ------- | ------------------------------------ |
| `inlineCssEnabled` | `boolean` | `true`  | Habilita el inline de CSS            |
| `inlineCssOptions` | `Options` | `{}`    | Opciones de `@css-inline/css-inline` |

### Adaptadores

| Clase               | Constructor                                                                          | Extensión por defecto |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| `HandlebarsAdapter` | `new HandlebarsAdapter(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig)` | `.hbs`                |
| `EjsAdapter`        | `new EjsAdapter(config?: TemplateAdapterConfig)`                                     | `.ejs`                |
| `PugAdapter`        | `new PugAdapter(config?: TemplateAdapterConfig)`                                     | `.pug`                |

Adaptador propio:

```typescript
import type { MailerOptions, TemplateAdapter } from '@tresdoce-nestjs-toolkit/mailer';

export class UppercaseAdapter implements TemplateAdapter {
  compile(mail: any, callback: (err?: any) => any, _options: MailerOptions): void {
    mail.data.html = String(mail.data.context?.body ?? '').toUpperCase();
    callback();
  }
}
```

### Interfaces y tipos exportados

| Export                                                                       | Descripción                                                           |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `MailerOptions`                                                              | Opciones del módulo                                                   |
| `TransportType`                                                              | Opciones/instancia/URL de transporte de Nodemailer                    |
| `ISendMailOptions`                                                           | Opciones de `sendMail`                                                |
| `TemplateAdapter`                                                            | Contrato de un adaptador de templates                                 |
| `TemplateAdapterConfig`                                                      | Configuración de inline CSS de los adaptadores                        |
| `MailerTransportFactory`                                                     | Contrato de la factory de transportes (`MAILER_TRANSPORT_FACTORY`)    |
| `MailerOptionsFactory`                                                       | Contrato `createMailerOptions()` para clases que generan las opciones |
| `Address`, `EmailAddress`, `Headers`, `TextEncoding`, `AttachmentLikeObject` | Tipos auxiliares de `ISendMailOptions`                                |

### Constantes exportadas

| Constante                  | Valor                                | Descripción                                 |
| -------------------------- | ------------------------------------ | ------------------------------------------- |
| `MAILER_OPTIONS`           | `'MAILER_OPTIONS'`                   | Token de inyección de las opciones          |
| `MAILER_TRANSPORT_FACTORY` | `'MAILER_TRANSPORT_FACTORY'`         | Token opcional de la factory de transportes |
| `defaultTransportOptions`  | `{ secure: true, requireTLS: true }` | Opciones sugeridas (no se aplican solas)    |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
