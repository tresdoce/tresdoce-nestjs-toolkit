<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Mailer</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/mailer.svg">
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
npm install -S @tresdoce-nestjs-toolkit/mailer
```

```
yarn add @tresdoce-nestjs-toolkit/mailer
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión **SMTP** en `configuration.ts` utilizando el key `mailer` que contenga los datos desde las
variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    mailer: {
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: true,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
      // Opcional: configuración de templates
      template: {
        dir: join(__dirname, './templates'),
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

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`transport`: Configuración del transporte SMTP. Puede ser un objeto de opciones, una cadena de conexión URL
(`smtps://user@domain.com:pass@smtp.domain.com`) o una instancia de transporte nodemailer.

- Type: `SMTPTransport.Options | string | Transport`
- Required: `true` (a menos que se use `transports`)

`transport.host`: Servidor SMTP.

- Type: `String`

`transport.port`: Puerto SMTP.

- Type: `Number`
- Default: `587`

`transport.secure`: Utilizar TLS.

- Type: `Boolean`
- Default: `true`

`transport.requireTLS`: Exige TLS aunque `secure` sea false.

- Type: `Boolean`
- Default: `true`

> **Nota:** Las constantes `defaultTransportOptions` exportadas por el módulo tienen preconfigurado
> `{ secure: true, requireTLS: true }`.

`transport.auth.user`: Usuario SMTP.

- Type: `String`

`transport.auth.pass`: Contraseña SMTP.

- Type: `String`

`transports`: Permite configurar múltiples transportadores con nombre para usar en entornos multi-tenant o multi-cuenta.

- Type: `{ [name: string]: SMTPTransport | SMTPTransport.Options | string }`
- Required: `false`

`defaults`: Opciones por defecto aplicadas a todos los correos enviados.

- Type: `Object`
- Example: `{ from: '"App" <noreply@app.com>' }`

`template.dir`: Directorio donde se encuentran los templates de email.

- Type: `String`

`template.adapter`: Adaptador de template a usar (`HandlebarsAdapter`, `EjsAdapter` o `PugAdapter`).

- Type: `TemplateAdapter`

`template.options`: Opciones adicionales pasadas al adaptador de template (ej. `{ strict: true }` para Handlebars).

- Type: `Object`

`options.partials.dir`: Directorio de partials de Handlebars (sólo aplica con `HandlebarsAdapter`).

- Type: `String`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo (configuración centralizada)

Importar el `MailerModule` en el archivo `app.module.ts`. El módulo obtiene la configuración automáticamente
desde `ConfigService` (key `config.mailer`).

```typescript
//./src/app.module.ts
import { MailerModule } from '@tresdoce-nestjs-toolkit/mailer';

@Module({
  //...
  imports: [
    //...
    MailerModule,
    //...
  ],
  //...
})
export class AppModule {}
```

### Importación estática con `forRoot`

Cuando no se usa la configuración centralizada, se puede inicializar el módulo directamente con `forRoot`:

```typescript
//./src/app.module.ts
import { MailerModule } from '@tresdoce-nestjs-toolkit/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: '"App" <noreply@app.com>',
      },
    }),
  ],
})
export class AppModule {}
```

### Envío de email simple

Inyectar el `MailerService` para realizar el envío de mails.

```typescript
//./src/app.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@tresdoce-nestjs-toolkit/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail() {
    try {
      return await this.mailerService.sendMail({
        to: 'destinatario <destinatario@email.com>',
        from: 'remitente <remitente@email.com>',
        subject: 'Asunto del mail',
        text: 'Cuerpo en texto plano',
        html: '<b>Cuerpo en HTML</b>',
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
```

### Templates de email

Se pueden usar tres adaptadores de template: **Handlebars**, **EJS** y **Pug**.

#### Handlebars

```typescript
//./src/config/configuration.ts
import { join } from 'path';
import { HandlebarsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

mailer: {
  transport: { /* ... */ },
  template: {
    dir: join(__dirname, './templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
  // Soporte de partials: directorio con archivos *.hbs registrados automáticamente
  options: {
    partials: {
      dir: join(__dirname, './templates/partials'),
    },
  },
}
```

Template Handlebars (`templates/welcome.hbs`):

```html
<p>Hola {{name}},</p>
<p>Bienvenido a NestJS Mailer.</p>
```

```typescript
await this.mailerService.sendMail({
  to: email,
  subject: 'Bienvenido',
  template: './welcome',
  context: { name: 'Juan' },
});
```

#### EJS

```typescript
//./src/config/configuration.ts
import { join } from 'path';
import { EjsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

mailer: {
  transport: { /* ... */ },
  template: {
    dir: join(__dirname, './templates'),
    adapter: new EjsAdapter(),
  },
}
```

Template EJS (`templates/welcome.ejs`):

```html
<p>Hola <%= name %>,</p>
<p>Bienvenido a NestJS Mailer.</p>
```

```typescript
await this.mailerService.sendMail({
  to: email,
  subject: 'Bienvenido',
  template: './welcome',
  context: { name: 'Juan' },
});
```

#### Pug

```typescript
//./src/config/configuration.ts
import { join } from 'path';
import { PugAdapter } from '@tresdoce-nestjs-toolkit/mailer';

mailer: {
  transport: { /* ... */ },
  template: {
    dir: join(__dirname, './templates'),
    adapter: new PugAdapter(),
  },
}
```

Template Pug (`templates/welcome.pug`):

```pug
p Hola #{name},
p Bienvenido a NestJS Mailer.
```

```typescript
await this.mailerService.sendMail({
  to: email,
  subject: 'Bienvenido',
  template: './welcome',
  context: { name: 'Juan' },
});
```

### CSS Inline

Todos los adaptadores tienen el inlining de CSS **habilitado por defecto** (`inlineCssEnabled: true`).
Para deshabilitar o personalizar:

```typescript
new HandlebarsAdapter(undefined, {
  inlineCssEnabled: false,
});

// O con opciones de @css-inline/css-inline:
new EjsAdapter({
  inlineCssEnabled: true,
  inlineCssOptions: {
    /* opciones de css-inline */
  },
});
```

### Múltiples transportadores

Cuando se necesita enviar correos desde distintas cuentas, se puede configurar `transports`:

```typescript
mailer: {
  transports: {
    primary: {
      host: process.env.EMAIL_HOST_PRIMARY,
      port: 587,
      auth: { user: process.env.EMAIL_USER_PRIMARY, pass: process.env.EMAIL_PASS_PRIMARY },
    },
    secondary: 'smtps://user2@domain.com:pass2@smtp.domain.com',
  },
  defaults: { from: '"App" <noreply@app.com>' },
}
```

Para enrutar el envío a un transportador específico, se usa el campo `transporterName`:

```typescript
await this.mailerService.sendMail({
  to: 'destinatario@email.com',
  subject: 'Asunto',
  text: 'Mensaje',
  transporterName: 'secondary', // nombre de la clave en transports
});
```

<a name="api-reference"></a>

## 📖 API Reference

### `MailerModule`

| Método                                          | Descripción                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `MailerModule` (sin argumentos)                 | Carga la configuración desde `ConfigService` (key `config.mailer`). Decorado con `@Global()`. |
| `MailerModule.forRoot(options?: MailerOptions)` | Inicialización estática con opciones directas.                                                |

### `MailerService`

| Método                                                          | Descripción                                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `sendMail(options: ISendMailOptions): Promise<SentMessageInfo>` | Envía un email. Si `options.transporterName` está definido, usa ese transportador; de lo contrario usa el transportador único. |

### `ISendMailOptions`

| Campo             | Tipo                                       | Descripción                                                     |
| ----------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `to`              | `EmailAddress`                             | Destinatario(s)                                                 |
| `cc`              | `EmailAddress`                             | Copia(s)                                                        |
| `bcc`             | `EmailAddress`                             | Copia(s) oculta(s)                                              |
| `from`            | `string \| Address`                        | Remitente                                                       |
| `replyTo`         | `string \| Address`                        | Dirección de respuesta                                          |
| `inReplyTo`       | `string \| Address`                        | En respuesta a                                                  |
| `subject`         | `string`                                   | Asunto                                                          |
| `text`            | `string \| Buffer \| AttachmentLikeObject` | Cuerpo en texto plano                                           |
| `html`            | `string \| Buffer`                         | Cuerpo en HTML                                                  |
| `sender`          | `string \| Address`                        | Remitente físico (Sender header)                                |
| `raw`             | `string \| Buffer`                         | Mensaje raw RFC822                                              |
| `textEncoding`    | `'quoted-printable' \| 'base64'`           | Codificación del texto                                          |
| `references`      | `string \| string[]`                       | Referencias de mensajes anteriores                              |
| `encoding`        | `string`                                   | Codificación del mensaje                                        |
| `date`            | `Date \| string`                           | Fecha del mensaje                                               |
| `headers`         | `Headers`                                  | Headers adicionales                                             |
| `attachments`     | `Attachment[]`                             | Archivos adjuntos                                               |
| `dkim`            | `DKIM.Options`                             | Opciones de firma DKIM                                          |
| `template`        | `string`                                   | Nombre del template a renderizar                                |
| `context`         | `{ [name: string]: any }`                  | Variables de contexto para el template                          |
| `transporterName` | `string`                                   | Nombre del transportador (para configuración multi-transporter) |

### `MailerOptions`

| Campo                  | Tipo                                                                   | Descripción                                |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `transport`            | `TransportType`                                                        | Configuración del transporte único         |
| `transports`           | `{ [name: string]: SMTPTransport \| SMTPTransport.Options \| string }` | Múltiples transportadores nombrados        |
| `defaults`             | `Options`                                                              | Opciones por defecto para todos los envíos |
| `template.dir`         | `string`                                                               | Directorio de templates                    |
| `template.adapter`     | `TemplateAdapter`                                                      | Adaptador de template                      |
| `template.options`     | `object`                                                               | Opciones adicionales del adaptador         |
| `options.partials.dir` | `string`                                                               | Directorio de partials Handlebars          |

### `TemplateAdapterConfig`

| Campo              | Tipo      | Default | Descripción                            |
| ------------------ | --------- | ------- | -------------------------------------- |
| `inlineCssEnabled` | `boolean` | `true`  | Habilita el inlining de CSS en el HTML |
| `inlineCssOptions` | `Options` | `{}`    | Opciones de `@css-inline/css-inline`   |

### Adaptadores exportados

| Clase               | Peer dep requerida      | Constructor                                |
| ------------------- | ----------------------- | ------------------------------------------ |
| `HandlebarsAdapter` | `handlebars` (incluida) | `new HandlebarsAdapter(helpers?, config?)` |
| `EjsAdapter`        | `ejs` (incluida)        | `new EjsAdapter(config?)`                  |
| `PugAdapter`        | `pug` (incluida)        | `new PugAdapter(config?)`                  |

### Constantes exportadas

| Constante                  | Valor                                | Descripción                        |
| -------------------------- | ------------------------------------ | ---------------------------------- |
| `MAILER_OPTIONS`           | `'MAILER_OPTIONS'`                   | Token de inyección de opciones     |
| `MAILER_TRANSPORT_FACTORY` | `'MAILER_TRANSPORT_FACTORY'`         | Token de la factory de transporte  |
| `defaultTransportOptions`  | `{ secure: true, requireTLS: true }` | Opciones de transporte por defecto |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
