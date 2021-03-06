<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Health</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.2.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensada para ser utilizada en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
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
npm install -S @tresdoce-nestjs-toolkit/health
```

```
yarn add @tresdoce-nestjs-toolkit/health
```

<a name="configurations"></a>

## ⚙️ Configuración

El módulo tiene la capacidad de utilizar la configuración centralizada para poder realizar los health checks
correspondientes a los servicios configurados.

Siguiendo la arquitectura del [NestJs Starter](https://github.com/rudemex/nestjs-starter), la información que se agrega
en la configuración de los `services` impacta en los health checks para él `readiness`.

Utilizando la propiedad `timeout` para configurar el tiempo de respuesta del servicio, como también la
propiedad `healthPath` para configurar la `url` a la cual realizar el ping check, si no se completa este campo, por
defecto realiza el ping al dominio de la url.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    services: {
      myApi: {
        url: process.env.MY_API_URL,
      },
      myApiTwo: {
        url: process.env.MY_API_TWO_URL,
        timeout: 5000,
        healthPath: '/health/endpoint/of/api',
      },
    },
    //...
  };
});
```

<a name="use"></a>

## 👨‍💻 Uso

Solamente hay que instanciar él `healthModule` en módulo principal de nuestra aplicación.

```typescript
//./src/app.module.ts
import { HealthModule } from '@tresdoce-nestjs-toolkit/health';

@Module({
  imports: [
    //...
    HealthModule,
    //...
  ],
  //...
})
export class AppModule {}
```

Para visualizar las respuestas de los endpoints, basta con navegar a `/health/live` y `/health/ready`.

### Liveness

**Schema:** `<http|https>://<server_url><:port>/health/live`<br/>
**Example:** `http://localhost:8080/health/live`

### Readiness

**Schema:** `<http|https>://<server_url><:port>/health/ready`<br/>
**Example:** `http://localhost:8080/health/ready`

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="../../.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
