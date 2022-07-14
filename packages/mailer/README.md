<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Mailer</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v9.0.0&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/mailer.svg">
    <br/>
<!--https://nest-modules.github.io/mailer/-->
<!--https://progressivecoder.com/nestjs-nodemailer-example-with-handlebars-sendgrid-twilio-smtp/-->
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
- NestJS v9.0.0 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/mailer
```

```
yarn add @tresdoce-nestjs-toolkit/mailer
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión **SMTP** en `configuration.ts` utilizando el key `mailer` que contenga los datos desde las
variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    mailer: {
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
    },
    //...
  };
});
```

<a name="use"></a>

## 👨‍💻 Uso

Importar el `MailerModule` en el archivo `app.module.ts`, y el módulo se encargará de obtener la configuración
y realizar la connexion automáticamente.

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

Inyectar el `MailerService` para poder realizar el envío de mails.

```typescript
//./src/app.service.ts
import { MailerService } from '@tresdoce-nestjs-toolkit/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail() {
    try {
      return await this.mailerService.sendMail({
        to: 'to <to@email.com>',
        from: 'from <from@email.com>',
        subject: 'Subject of mail',
        text: 'this is a plain text',
        html: '<b>this is a html email</b>',
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
```

### Template (ejs, pug o handlebars)

Para poder trabajar con templates de email, hay que agregarle la configuración `templates` en el `configuration.ts` y
especificar que adaptador vas a utilizar y la ruta de donde se encuentran los templates.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import { HandlebarsAdapter } from '@tresdoce-nestjs-toolkit/mailer';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    mailer: {
      transport: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
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

#### Envío de mail con template

```typescript
//./src/app.service.ts
import { MailerService } from '@tresdoce-nestjs-toolkit/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(email: string, name: string) {
    try {
      return await this.mailerService.sendMail({
        to: email,
        from: 'from <from@email.com>',
        subject: 'Greeting from NestJS NodeMailer',
        template: './email',
        context: {
          name: name,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
```

#### Email template

```html
//templates/email.hbs
<p>Hi {{name}},</p>
<p>Hello from NestJS NodeMailer</p>
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
