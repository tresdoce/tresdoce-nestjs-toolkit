<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.2.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.0&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/utils.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este interceptor se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.19.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v11.2.0 or higher
- NestJS v11.1.0 or higher ([Documentación](https://nestjs.com/))

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

<a name="configuración-redact"></a>

### ⚙️ Configuración

Agregar los parámetros de configuración de **fast-redact** en `configuration.ts` utilizando el key `redact` y que
contenga el objeto con todas sus propiedades para utilizar en el ofuscamiento.

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

<a name="uso-redact"></a>

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

<a name="uso-format-number"></a>

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
import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  formatNumberToUSDCurrency() {
    const formatOptions = {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    };

    return this.formatService.formatNumber({ num: 123456.789, formatOptions, locale: 'es-AR' });
    // Return: $ 123.456,79
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

## Format Date

El servicio `FormatService` tiene disponible funciones que tiene como fin trabajar y manipular fechas utilizando
[Luxon](https://moment.github.io/luxon/#/) como dependencia base.

#### Funciones disponibles

- `.dateTimeRef()`: Retorna la instancia `DateTime` de **Luxon**.
- `.formatDate()`: Formatea un valor de tipo `Date`.
- `.dateToISO()`: Convierte un valor de tipo `Date` a formato ISO 8601 (Default zone: 0)
- `.calculateTimestampDiff()`: Calcula la diferencia entre dos valores `timestamp`.

<a name="uso-format-date"></a>

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

### .dateTimeRef()

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  FormatService,
  DEFAULT_TIMEZONE, // utc
  DEFAULT_TIMEZONE_LOCALE, // 'America/Argentina/Buenos_Aires'
} from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  myFunction() {
    const cDate = this.formatService.dateTimeRef().now();
    return {
      '1': cDate, // Return: Object DateTime
      '2': cDate.toISO(), // Return: 2023-07-13T16:12:09.470+00:00
      '3': cDate.setZone(DEFAULT_TIMEZONE).toISO(), // Return: 2023-07-13T16:12:09.473Z
      '4': cDate.setZone(DEFAULT_TIMEZONE_LOCALE).toISO(), // Return: 2023-07-13T13:12:09.473-03:00
    };
  }
}
```

### .formatDate()

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  myFunction() {
    const cDate = new Date();

    const formatDateOpts = {
      formatDate: 'fff',
      timezone: 'Europe/Paris',
      locale: 'fr'
    };

    return {
      '1':this.formatService.formatDate({ date: cDate }) },// Return: 20/12/2022 14:37:17.020
      '2':this.formatService.formatDate({ date: cDate, ...formatDateOpts}) }, // Return: 20 décembre 2022, 15:37.020 UTC+1
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

La función `.formatDate()` admite un objeto con cuatro parámetros los cuales se detallan a continuación.

`date`: Es la fecha a formatear.

- Type: `Date`
- Example: `'2022-12-20T14:37:17.020Z'`

`formatDate`: Es el formato a convertir la fecha ingresada, Para más información sobre que formato puedes revisar la
[documentación de Luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)

- Type: `String`
- Default: `'dd/LL/yyyy TT.SSS'`

`timezone`: Es la zona horaria para ajustar la fecha ingresada.

- Type: `String`
- Default: `'utc'`
- Example: ` 'America/Argentina/Buenos_Aires' | 'Europe/Paris'`

`locale`: Este parámetro sirve para configurar la internalización para el formateo. [Locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#locales)

- Type: `String`
- Default: `'es-AR'`
- Example: `'en-US' | 'de-DE' | 'en-IN' | 'en-GB'`

</details>

### .dateToISO()

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { FormatService, DEFAULT_TIMEZONE_LOCALE } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  myFunction() {
    const cDate = new Date();
    return {
      '1': this.formatService.dateToISO({ date: cDate }), // Return: 2023-07-12T12:06:29.957Z
      '2': this.formatService.dateToISO({ date: cDate, timezone: DEFAULT_TIMEZONE_LOCALE }), // Return: 2023-07-12T09:06:29.957-03:00
    };
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

La función `.dateToISO()` admite un objeto con dos parámetros los cuales se detallan a continuación.

`date`: Es la fecha a formatear.

- Type: `Date`
- Example: `'2022-12-20T14:37:17.020Z'`

`timezone`: Es la zona horaria para ajustar la fecha ingresada.

- Type: `String`
- Default: `'utc'`
- Example: ` 'America/Argentina/Buenos_Aires' | 'Europe/Paris'`

</details>

### .calculateTimestampDiff()

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  myFunction() {
    const startTimestamp = 1689208308510;
    const endTimestamp = 1689208308525;
    const optionsCalculate = { unit: 'seconds', addSuffix: true };

    return {
      '1': this.formatService.calculateTimestampDiff({
        startTime: startTimestamp,
        endTime: endTimestamp,
      }), //Return: 15
      '2': this.formatService.calculateTimestampDiff({
        startTime: startTimestamp,
        endTime: endTimestamp,
        options: optionsCalculate,
      }), //Return: '0.015s'
    };
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

La función `.calculateTimestampDiff()` admite un objeto con tres parámetros los cuales se detallan a continuación.

`startTime`: Es el `timestamp` de inicio o más viejo a comparar y obtener la diferencia.

- Type: `number`
- Example: `1689208308510`

`endTime`: Es el `timestamp` más reciente a comparar y obtener la diferencia con el `startTime`.

- Type: `number`
- Example: `1689208308525`

`options`: Es un objeto de configuración el cual admite dos propiedades. `unit` es la unidad a retornar la diferencia
entre los datos ingresados y `addSuffix` agrega la unidad en la salida, dependiendo el valor de este último, la salida
puede ser de tipo `number` o `string`

- Type: `Object`
- Default: `{ unit: 'milliseconds', addSuffix: false }`
- Example: ` { unit: 'seconds', addSuffix: true }`

</details>

## Bcrypt

El módulo Bcrypt proporciona funcionalidades para encriptar, hashear y comparar datos utilizando el algoritmo bcrypt.

### ⚙️ Configuración

Agregar los parámetros de configuración de **Bcrypt** en `configuration.ts` utilizando el key `bcrypt` y que
contenga el objeto con todas sus propiedades para utilizar la encriptación y hash con valores custom, en caso contrario,
no es necesario modificar el configuration.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    bcrypt: {
      rounds: 16,
      minor: 'b',
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`rounds`: Número de rondas de sal para generar la sal

- Type: `Number`
- Default: `16`
- Example: `10`

`minor`: Versión menor de **bcrypt** a utilizar

- Type: `String`
- Default: `b`
- Example: ` a`

</details>

### 👨‍💻 Uso

Importar el `BcryptModule` en el módulo principal de la aplicación.

```typescript
// ./src/my.module.ts
import { Module } from '@nestjs/common';
import { BcryptModule } from '@tresdoce-nestjs-toolkit/paas';

@Module({
  //...
  imports: [
    //...
    BcryptModule,
    //...
  ],
  //...
})
export class MyModule {}
```

Luego hay que inyectar el `BcryptService` en el servicio para hacer uso de los métodos disponibles.

#### encrypt

Encripta los datos asincrónicamente.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  async encryptExample() {
    const data = 'password';
    const encryptedData = await this.bcryptService.encrypt(data);
    console.log('Encrypted data:', encryptedData);
  }
}
```

#### compare

Compara los datos con los datos encriptados asincrónicamente.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  async compareExample() {
    const data = 'password';
    const encryptedData = await this.bcryptService.encrypt(data);
    const isMatch = await this.bcryptService.compare(data, encryptedData);
    console.log('Data matches encrypted data:', isMatch);
  }
}
```

#### encryptSync

Encripta los datos sincrónicamente.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  encryptSyncExample() {
    const data = 'password';
    const encryptedData = this.bcryptService.encryptSync(data);
    console.log('Encrypted data:', encryptedData);
  }
}
```

#### compareSync

Compara los datos con los datos encriptados sincrónicamente.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  compareSyncExample() {
    const data = 'password';
    const encryptedData = this.bcryptService.encryptSync(data);
    const isMatch = this.bcryptService.compareSync(data, encryptedData);
    console.log('Data matches encrypted data:', isMatch);
  }
}
```

#### generatePasswordHash

Genera un hash seguro para una contraseña.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  generatePasswordHashExample() {
    const password = 'password';
    const hash = this.bcryptService.generatePasswordHash(password);
    console.log('Password hash:', hash);
  }
}
```

#### validateHash

Válida si un hash es válido para las rondas de sal actuales.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}

  validateHashExample() {
    const password = 'password';
    const hash = this.bcryptService.generatePasswordHash(password);
    const isValid = this.bcryptService.validateHash(hash);
    console.log('Is hash valid?', isValid);
  }
}
```

#### generateSalt

Genera una nueva sal para usar en el proceso de hash.

```typescript
// ./src/my.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/paas';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {
    this.bcryptService.generateSalt(10, 'a');
  }
  //...
}
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
