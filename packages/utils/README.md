<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v9.2.1&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/utils.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este interceptor se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.up.railway.app/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v9.2.1 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/utils
```

```
yarn add @tresdoce-nestjs-toolkit/utils
```

## Redact

El módulo de **Redact** está pensado para el uso de ofuscamiento de datos sensibles para la implementación de una librería
como asi también en el uso de una aplicación.

Este módulo utiliza como base [`fast-redact`](https://github.com/davidmarkclements/fast-redact), pero se implementaron
algunas mejoras.

<a name="-configuración-redact"></a>

### ⚙️ Configuración

Agregar los parámetros de configuración de **fast-redact** en `configuration.ts` utilizando el key `redact` y que
contenga
el objeto con todas sus propiedades para utilizar en el ofuscamiento.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import * as PACKAGE_JSON from '../../package.json';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    redact: {
      paths: process.env.REDACT_OBFUSCATE ? process.env.REDACT_OBFUSCATE.split(',') : [],
      censor: '****',
      obfuscateFrom: 'right',
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`paths`: Es un array de string, en el que se recomienda ser seteado por variables de entorno como strings
separados por coma para que pueda impactar rápidamente en la aplicación sin requerir un re-despliegue.
El path sigue la sintaxis standard de
EcmaScript. [Más info](https://github.com/davidmarkclements/fast-redact#paths--array)

- `a.b.c`
- `a['b'].c`
- `a["b-c"].d`
- `["a-b"].c`
- `a.b.*`
- `a[*].c`
- `*.b`
- `a[0].b`

- Type: `String[]`
- Example: `headers.request['authorization'],headers.request['apiKey']`

`censor`: Es el valor por el cual va a reemplazar el dato sensible, considerar que la longitud del censor es la
cantidad de caracteres que va a reemplazar al valor a ofuscar, es decir, si la longitud del censor es de 4 caracteres,
al valor a ofuscar va a reemplazar son los últimos 4 caracteres con el valor seteado.

- Type: `String`
- Default: `****`
- Example: `400012345678****`

`obfuscateFrom`: Indica de qué lado del valor a ofuscar va a realizarse el ofuscamiento, considerar que esta opción se
aplica a todos los datos a ofuscar, y no por path.

- Type: `String`
- Default: `right`
- Values: `left | right`
- Example: `****123456784126 | 400012345678****`

`remove`: Remueve la key con su valor.

- Type: `Boolean`
- Default: `false`

`serialize`: Maneja la salida del ofuscamiento. Si se proporciona una función, se utilizará para serializar el objeto
redactado, en caso de configurarlo en `true` devuelve un `JSON.stringify`, de lo contrario devuelve el `JSON`.

- Type: `Boolean|Function`
- Default: `false`

</details>

Instanciar `RedactModule` en el módulo correspondiente, si es global para una aplicación (recomendado), estaría en el
`app.module.ts`, o bien en el módulo que requiera utilizar esta funcionalidad, en el caso de una lib estaría en el
módulo principal de esa lib.

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/paas';

@Module({
  imports: [
    //...
    RedactModule,
    //...
  ],
  //...
})
export class AppModule {}
```

O bien puedes utilizar el metódo `.register()` para configurar el módulo en caso de no querer usar la configuración
centralizada.

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/paas';

@Module({
  imports: [
    //...
    RedactModule.register({
      paths: ['my.path'],
      censor: 'xxxx',
      obfuscateFrom: 'left',
    }),
    //...
  ],
  //...
})
export class AppModule {}
```

Cuando necesite pasar las opciones del módulo de forma asincrónica en lugar de estática, utilice el
método `.registerAsync()`.

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/paas';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    //...
    RedactModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get('config.redact'),
      inject: [ConfigService],
    }),
    //...
  ],
  //...
})
export class AppModule {}
```

O también puede hacerlo asi.

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/paas';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    //...
    RedactModule.registerAsync({
      useFactory: () => ({
        paths: ['my.path'],
        censor: 'xxxx',
        obfuscateFrom: 'left',
      }),
    }),
    //...
  ],
  //...
})
export class AppModule {}
```

<a name="-uso-redact"></a>

### 👨‍💻 Uso

> ⚠️ Considerar que el `RedactModule` realiza una mutación del valor del parámetro, por lo que si no se maneja
> adecuadamente, podría retornar el dato modificado.

```typescript
// ./my-service.ts
import { RedactService } from '@tresdoce-nestjs-toolkit/paas';

export class MyService {
  constructor(@Inject(RedactService) private redactService: RedactService) {}

  async funcOfService(data) {
    //...
    console.log(this.redactService.obfuscate(data));
    // Return { myKey: 'value-obfuscxxxx' }

    console.log(this.redactService.obfuscate(data, false)); // retorna como string
    // Return "{ \"myKey\": \"value-obfuscxxxx\" }"
    //...
  }
}
```

## Format Number

El servicio `FormatService` tiene disponible la función `.formatNumber()` que tiene como fin formatear números, utilizando
el método [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
que es un objeto integrado en JavaScript que permite el formateo numérico sensible al idioma.
Proporciona una forma flexible de convertir un número en una cadena con formato, teniendo en cuenta las convenciones
locales de formateo numérico cómo asi también soporta opciones personalizadas de formateo.

<a name="-uso-format-number"></a>

### 👨‍💻 Uso

Importar el `FormatService` como provider en el módulo que va a hacer uso de este servicio.

```typescript
// ./src/my.module.ts
import { Module } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/paas';

@Module({
  //...
  providers: [
    //...
    FormatService,
    //...
  ],
  //...
})
export class MyModule {}
```

Luego hay que inyectar el `FormatService` en el servicio.

```typescript
// ./src/my.service.ts
import { Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly formatService: FormatService) {}

  formatNumberToUSDCurrency() {
    const formatOptions = {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    };

    return this.formatService.formatNumber({ num: 123456.789, formatOptions, locale: 'es-AR' });
    // Retorna: $ 123.456,79
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

La función `.formatNumber()` admite un objeto con tres parámetros los cuales se detallan a continuación.

`num`: El número a darle un formato el cual es requerido.

- Type: `Number`
- Example: `'123456.789 | 16 | -3500'`

`formatOptions`: Es la customización para darle formato al número a formatear. Para más información sobre que parámetros
admite es recomendable leer la [Documentación de Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)

- Type: `Object`
- Example: `{ style: 'currency', currency: 'USD' }`

`locale`: Este parámetro sirve para configurar la internalización para el formateo. [Locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#locales)

- Type: `String`
- Default: `'es-AR'`
- Example: `'en-US' | 'de-DE' | 'en-IN' | 'en-GB'`

</details>

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
