<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/utils.svg">
    <br/>
</div>
<br/>

> Este package también es re-exportado por `@tresdoce-nestjs-toolkit/paas`, por lo que en proyectos basados en el starter puedes importar desde allí si lo deseas.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [🔖 Módulos disponibles](#modules)
  - [Redact](#redact)
  - [Format](#format)
  - [Bcrypt](#bcrypt)
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

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/utils
```

```
yarn add @tresdoce-nestjs-toolkit/utils
```

<a name="internal-dependencies"></a>

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

Es un paquete **ESM-only** (`"type": "module"`): se consume con `import` desde proyectos ESM.
`RedactModule` (sin `.register()`) y `BcryptModule` leen su configuración con `ConfigService`, por lo que
requieren `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })` de `@nestjs/config` en la aplicación.

| Módulo         | Key de `Typings.AppConfig` | Dependencias externas                                             |
| -------------- | -------------------------- | ----------------------------------------------------------------- |
| `RedactModule` | `config.redact`            | [`fast-redact`](https://github.com/davidmarkclements/fast-redact) |
| `FormatModule` | —                          | [`luxon`](https://moment.github.io/luxon/), `Intl` nativo         |
| `BcryptModule` | `config.bcrypt`            | [`bcrypt`](https://github.com/kelektiv/node.bcrypt.js) (nativo)   |

> No requiere servicios externos (Redis, bases de datos, etc.), por lo que no hace falta `docker-compose`.

<a name="modules"></a>

---

## Redact

El módulo **Redact** está pensado para el ofuscamiento de datos sensibles tanto en librerías como en aplicaciones.
Utiliza como base [`fast-redact`](https://github.com/davidmarkclements/fast-redact) con algunas mejoras adicionales
(obfuscación parcial de valores desde la izquierda o la derecha). Es utilizado internamente por
`@tresdoce-nestjs-toolkit/logger`, `elk`, `tracing` y `http-client` para ofuscar headers, bodies y query params.

<a name="configuración-redact"></a>

### ⚙️ Configuración

Agregar los parámetros de configuración de **Redact** en `configuration.ts` utilizando la key `redact`:

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

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

`paths`: Array de strings con los paths a ofuscar. Se recomienda setearlos por variable de entorno separados por coma
para impactar sin re-deploy. Sigue la sintaxis estándar de EcmaScript.
[Más info](https://github.com/davidmarkclements/fast-redact#paths--array)

- Type: `String[]`
- Example: `headers.request['authorization'],headers.request['apiKey']`
- Ejemplos de sintaxis soportada:
  - `a.b.c`
  - `a['b'].c`
  - `a["b-c"].d`
  - `["a-b"].c`
  - `a.b.*`
  - `a[*].c`
  - `*.b`
  - `a[0].b`

`censor`: Valor por el cual se reemplaza el dato sensible. Si es un string, su longitud determina cuántos caracteres se
reemplazan en el valor original (los últimos N si `obfuscateFrom` es `right`, los primeros N si es `left`).
Los valores que **no son string** (números, booleanos, objetos o arrays) y los strings más cortos que el censor se
reemplazan por el censor completo. También puede ser una función `(value) => any` que recibe el valor original.

- Type: `String | Function`
- Default: `****`
- Example: `400012345678****`

`obfuscateFrom`: Indica desde qué lado del valor se realiza el ofuscamiento.

- Type: `String`
- Default: `right`
- Values: `left | right`
- Example: `****123456784126` (left) | `400012345678****` (right)

`remove`: Si es `true`, elimina la key y su valor del objeto en lugar de ofuscar. `fast-redact` solo lo permite
cuando la salida se serializa con `JSON.stringify`, así que debe combinarse con `serialize: true` (si no, el módulo
falla al inicializarse con `remove option may only be set when serializer is JSON.stringify`).

- Type: `Boolean`
- Default: `false`

`strict`: Si es `true`, lanza un error cuando un path indicado no existe en el objeto a ofuscar. Si es `false`
(por defecto), ignora los paths faltantes silenciosamente.

- Type: `Boolean`
- Default: `false`

`serialize`: Controla la salida del proceso de ofuscamiento. Si es `false`, retorna el objeto JavaScript mutado.
Si es `true`, retorna el resultado de `JSON.stringify`. Si se proporciona una función, la utiliza como serializador
personalizado.

- Type: `Boolean | Function`
- Default: `false`

</details>

### 👨‍💻 Uso con configuración centralizada

Importar `RedactModule` en el módulo raíz de la aplicación (recomendado como global):

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/utils';

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

### 👨‍💻 Uso con `.register()`

Para configurar el módulo de forma estática sin depender de `ConfigService`:

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/utils';

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

### 👨‍💻 Uso con `.registerAsync()`

Para pasar las opciones de forma asincrónica:

```typescript
//./src/app.module.ts
import { RedactModule } from '@tresdoce-nestjs-toolkit/utils';
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

### Inyectando `RedactService`

> ⚠️ `RedactModule` es global por defecto, por lo que `RedactService` está disponible en toda la aplicación una vez importado el módulo en `AppModule`.

Para usar una configuración de redacción **local** a un módulo (por ejemplo, en una librería que no debe
pisar la configuración global de la app), pasá `isGlobal: false`. Así lo hacen internamente `logger` y `elk`:

```typescript
@Module({
  imports: [
    RedactModule.registerAsync({
      isGlobal: false,
      useFactory: () => ({ paths: ['password'], censor: '****' }),
    }),
    // o bien: RedactModule.register({ paths: ['password'] }, false)
  ],
  providers: [MyLibraryService], // recibe el RedactService con esta configuración
})
export class MyLibraryModule {}
```

> ⚠️ `obfuscate()` trabaja sobre una copia profunda (`JSON.parse(JSON.stringify(data))`): el objeto original no se
> modifica, pero los valores no serializables a JSON (funciones, `undefined`, `Date` → string) se pierden o transforman.

```typescript
// ./my-service.ts
import { Injectable } from '@nestjs/common';
import { RedactService } from '@tresdoce-nestjs-toolkit/utils';

@Injectable()
export class MyService {
  constructor(private readonly redactService: RedactService) {}

  async funcOfService(data: object) {
    // _serialize = true (default): retorna el objeto JavaScript con los valores ofuscados
    const redacted = this.redactService.obfuscate(data);
    // Return: { myKey: 'value-obfuscxxxx' }

    // _serialize = false: retorna el resultado como string JSON
    const redactedString = this.redactService.obfuscate(data, false);
    // Return: '{"myKey":"value-obfuscxxxx"}'
  }
}
```

#### 📤 Ejemplos de salida

Con `paths: ['card.number', 'headers.authorization', 'pin', 'user.address']` y el censor por defecto:

```typescript
this.redactService.obfuscate({
  card: { number: '4000123456784126', holder: 'Juan' },
  headers: { authorization: 'Bearer abc.def' },
  pin: 1234,
  user: { address: { street: 'Av. Siempre Viva' } },
});
```

```json
{
  "card": { "number": "400012345678****", "holder": "Juan" },
  "headers": { "authorization": "Bearer abc****" },
  "pin": "****",
  "user": { "address": "****" }
}
```

| Opciones                                             | Entrada                                    | Salida                                     |
| ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `obfuscateFrom: 'left'`                              | `{ card: { number: '4000123456784126' } }` | `{ card: { number: '****123456784126' } }` |
| `paths: ['password'], remove: true, serialize: true` | `{ user: 'mex', password: 'secret' }`      | `'{"user":"mex"}'`                         |
| `RedactModule.register({})` (sin paths)              | `{ apiKey: '123456789' }`                  | `{ apiKey: '123456789' }`                  |

> Con `serialize: true` (o una función) en la configuración, `obfuscate(data)` retorna un **string**.

---

## Format

El módulo **Format** expone el servicio `FormatService` con utilidades para formatear números, fechas y diferencias
de tiempo (usado por `logger` y `tracing` para `http_duration_ms` y timestamps).
`FormatModule` es un módulo global que puede importarse una sola vez en `AppModule`.

> ℹ️ Desde Node 20/22 (ICU 72+), `Intl` usa espacios especiales: _no-break space_ (`U+00A0`) en monedas
> (`$ 1.234,50`) y _narrow no-break space_ (`U+202F`) en separadores de miles (`fr-FR`) y meridianos
> (`12:00 AM`, `11:37 a. m.`). `formatNumber()` y `formatDate()` los **normalizan a un espacio común**, para que la
> salida sea estable entre versiones de Node y se pueda comparar en tests sin sorpresas.

#### 📤 Ejemplos de salida

| Llamada                                                                                                                     | Resultado                           |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `formatNumber({ num: 123456.789 })`                                                                                         | `'123.456,789'`                     |
| `formatNumber({ num: 123456.789, formatOptions: { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' } })` | `'$ 123.456,79'`                    |
| `formatNumber({ num: 123456.789, locale: 'en-US', formatOptions: { style: 'currency', currency: 'USD' } })`                 | `'$123,456.79'`                     |
| `formatNumber({ num: 1234567.5, locale: 'fr-FR' })`                                                                         | `'1 234 567,5'`                     |
| `formatNumber({ num: 0.123456, locale: 'en-US', formatOptions: { style: 'percent', minimumFractionDigits: 2 } })`           | `'12.35%'`                          |
| `formatNumber({ num: 16, formatOptions: { style: 'unit', unit: 'liter', unitDisplay: 'long' } })`                           | `'16 litros'`                       |
| `formatNumber({ num: 1500000, formatOptions: { notation: 'compact' } })`                                                    | `'1,5 M'`                           |
| `formatDate({ date })`                                                                                                      | `'20/12/2022 14:37:17.020'`         |
| `formatDate({ date, formatDate: 'fff', timezone: 'Europe/Paris', locale: 'fr' })`                                           | `'20 décembre 2022 à 15:37 UTC+1'`  |
| `formatDate({ date, formatDate: 'DDDD', timezone: DEFAULT_TIMEZONE_LOCALE })`                                               | `'martes, 20 de diciembre de 2022'` |
| `formatDate({ date, formatDate: 'hh:mm a', timezone: DEFAULT_TIMEZONE_LOCALE })`                                            | `'11:37 a. m.'`                     |
| `formatDate({ date, formatDate: 't', locale: 'en-US', timezone: 'America/New_York' })`                                      | `'9:37 AM'`                         |
| `dateToISO({ date })`                                                                                                       | `'2022-12-20T14:37:17.020Z'`        |
| `dateToISO({ date, timezone: DEFAULT_TIMEZONE_LOCALE })`                                                                    | `'2022-12-20T11:37:17.020-03:00'`   |
| `calculateTimestampDiff({ startTime: 0, endTime: 90000 })`                                                                  | `90000`                             |
| `calculateTimestampDiff({ startTime: 0, endTime: 90000, options: { unit: 'minutes', addSuffix: true } })`                   | `'1.5min'`                          |
| `calculateTimestampDiff({ startTime: 0, endTime: 5400000, options: { unit: 'hours' } })`                                    | `1.5`                               |

_`date = new Date('2022-12-20T14:37:17.020Z')`; los resultados de `formatNumber`/`formatDate` dependen de los datos
ICU de Node._

### ⚙️ Configuración

`FormatModule` no requiere configuración centralizada. Basta con importarlo en el módulo donde se necesite,
o en `AppModule` para disponibilizarlo globalmente:

```typescript
//./src/app.module.ts
import { FormatModule } from '@tresdoce-nestjs-toolkit/utils';

@Module({
  imports: [
    //...
    FormatModule,
    //...
  ],
})
export class AppModule {}
```

Si se prefiere usar `FormatService` sin importar el módulo global, puede agregarse directamente como provider:

```typescript
// ./src/my.module.ts
import { Module } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';

@Module({
  providers: [FormatService],
  exports: [FormatService],
})
export class MyModule {}
```

### 👨‍💻 Uso

Inyectar `FormatService` en el servicio:

```typescript
// ./src/my.service.ts
import { Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';

@Injectable()
export class MyService {
  constructor(private readonly formatService: FormatService) {}
}
```

### .formatNumber()

Formatea un número usando [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).

```typescript
formatNumberToUSDCurrency() {
  return this.formatService.formatNumber({
    num: 123456.789,
    locale: 'es-AR',
    formatOptions: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    },
  });
  // Return: '$ 123.456,79'
}
```

<details>
<summary>💬 Propiedades de FormatNumberOptions</summary>

`num`: El número a formatear. **Requerido.**

- Type: `number`
- Example: `123456.789 | 16 | -3500`

`formatOptions`: Opciones de formato de `Intl.NumberFormat`.
[Documentación](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)

- Type: `Intl.NumberFormatOptions`
- Example: `{ style: 'currency', currency: 'USD' }`

`locale`: Locale de internacionalización.
[Locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#locales)

- Type: `string`
- Default: `'es-AR'`
- Example: `'en-US' | 'de-DE' | 'en-IN' | 'en-GB'`

</details>

### .dateTimeRef()

Retorna la instancia `DateTime` de [Luxon](https://moment.github.io/luxon/#/) para usar directamente.

```typescript
import {
  FormatService,
  DEFAULT_TIMEZONE,
  DEFAULT_TIMEZONE_LOCALE,
} from '@tresdoce-nestjs-toolkit/utils';

myFunction() {
  const cDate = this.formatService.dateTimeRef().now();
  return {
    '1': cDate,                                            // Object DateTime de Luxon
    '2': cDate.toISO(),                                    // '2023-07-13T16:12:09.470+00:00'
    '3': cDate.setZone(DEFAULT_TIMEZONE).toISO(),          // '2023-07-13T16:12:09.473Z'
    '4': cDate.setZone(DEFAULT_TIMEZONE_LOCALE).toISO(),   // '2023-07-13T13:12:09.473-03:00'
  };
}
```

### .formatDate()

Formatea un objeto `Date` en un string con el formato y zona horaria especificados.

```typescript
myFunction() {
  const cDate = new Date();

  return {
    '1': this.formatService.formatDate({ date: cDate }),
    // Return: '20/12/2022 14:37:17.020'

    '2': this.formatService.formatDate({
      date: cDate,
      formatDate: 'fff',
      timezone: 'Europe/Paris',
      locale: 'fr',
    }),
    // Return: '20 décembre 2022 à 15:37 UTC+1'
  };
}
```

<details>
<summary>💬 Propiedades de FormatDateOptions</summary>

`date`: Fecha a formatear. **Requerida.**

- Type: `Date`

`formatDate`: Formato de salida. Ver
[tokens de Luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).

- Type: `string`
- Default: `'dd/LL/yyyy TT.SSS'`

`timezone`: Zona horaria para ajustar la fecha.

- Type: `string`
- Default: `'utc'`
- Example: `'America/Argentina/Buenos_Aires' | 'Europe/Paris'`

`locale`: Locale de internacionalización.

- Type: `string`
- Default: `'es-AR'`

</details>

### .dateToISO()

Convierte un objeto `Date` a string en formato ISO 8601 (retorna `null` si la fecha es inválida).

```typescript
myFunction() {
  const cDate = new Date();
  return {
    '1': this.formatService.dateToISO({ date: cDate }),
    // Return: '2023-07-12T12:06:29.957Z'

    '2': this.formatService.dateToISO({ date: cDate, timezone: DEFAULT_TIMEZONE_LOCALE }),
    // Return: '2023-07-12T09:06:29.957-03:00'
  };
}
```

<details>
<summary>💬 Propiedades de ISOFormatDateOptions</summary>

`date`: Fecha a convertir. **Requerida.**

- Type: `Date`

`timezone`: Zona horaria para ajustar la fecha.

- Type: `string`
- Default: `'utc'`
- Example: `'America/Argentina/Buenos_Aires' | 'Europe/Paris'`

</details>

### .calculateTimestampDiff()

Calcula la diferencia entre dos timestamps en milisegundos (u otra unidad).

```typescript
myFunction() {
  const startTimestamp = 1689208308510;
  const endTimestamp = 1689208308525;

  return {
    '1': this.formatService.calculateTimestampDiff({
      startTime: startTimestamp,
      endTime: endTimestamp,
    }),
    // Return: 15  (número, en milisegundos)

    '2': this.formatService.calculateTimestampDiff({
      startTime: startTimestamp,
      endTime: endTimestamp,
      options: { unit: 'seconds', addSuffix: true },
    }),
    // Return: '0.015s'
  };
}
```

<details>
<summary>💬 Propiedades de CalculateTimestampDiffOptions</summary>

`startTime`: Timestamp de inicio (más antiguo). **Requerido.**

- Type: `number`
- Example: `1689208308510`

`endTime`: Timestamp de fin (más reciente). **Requerido.**

- Type: `number`
- Example: `1689208308525`

`options`: Objeto de configuración opcional.

- Type: `TimestampDiffOptions`
- Default: `{ unit: 'milliseconds', addSuffix: false }`
  - `unit`: Unidad del resultado (`TimeUnit`). Cuando `addSuffix` es `false` devuelve `number`; cuando es `true` devuelve `string`.
  - `addSuffix`: Agrega el sufijo de la unidad al resultado.

</details>

---

## Bcrypt

El módulo **Bcrypt** proporciona funcionalidades para hashear y comparar datos (por ejemplo contraseñas) usando el
algoritmo bcrypt. Cada hash se genera con una **sal aleatoria propia**, por lo que hashear dos veces el mismo valor
produce resultados distintos; para verificar siempre se usa `compare()`/`compareSync()`, nunca comparación de strings.

### ⚙️ Configuración

`BcryptModule` toma su configuración desde la key `bcrypt` de `configuration.ts`. Si no se define, usa los valores por defecto.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    bcrypt: {
      rounds: 16, // default: 16
      minor: 'b', // default: 'b'
    },
    //...
  };
});
```

<details>
<summary>💬 Propiedades de BcryptOptions</summary>

`rounds`: Costo (log2 de iteraciones) para la generación del hash. A mayor valor, más seguro pero más lento: cada
ronda extra duplica el tiempo (16 rondas ≈ varios segundos por hash; 10–12 suele ser suficiente para APIs). En tests
conviene usar `4` (mínimo de bcrypt).

- Type: `number`
- Default: `16`
- Env sugerida: `BCRYPT_ROUNDS` (por ejemplo `rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10)`)

`minor`: Versión menor de bcrypt a utilizar (`'a'` o `'b'`).

- Type: `BcryptVersion` (`'a' | 'b'`)
- Default: `'b'`

</details>

### 👨‍💻 Uso

Importar `BcryptModule` en el módulo que lo requiera (es `@Global()`, alcanza con importarlo una vez). Requiere
`ConfigModule` global, ya que lee `config.bcrypt` con `ConfigService`:

```typescript
// ./src/my.module.ts
import { Module } from '@nestjs/common';
import { BcryptModule } from '@tresdoce-nestjs-toolkit/utils';

@Module({
  imports: [BcryptModule],
})
export class MyModule {}
```

Inyectar `BcryptService` en el servicio:

```typescript
// ./src/my.service.ts
import { Injectable } from '@nestjs/common';
import { BcryptService } from '@tresdoce-nestjs-toolkit/utils';

@Injectable()
export class MyService {
  constructor(private readonly bcryptService: BcryptService) {}
}
```

#### encrypt (async)

```typescript
async encryptExample() {
  const encrypted = await this.bcryptService.encrypt('password');
  console.log(encrypted); // '$2b$16$...'
}
```

#### encryptSync (sync)

```typescript
encryptSyncExample() {
  const encrypted = this.bcryptService.encryptSync('password');
  console.log(encrypted); // '$2b$16$...'
}
```

#### compare (async)

```typescript
async compareExample() {
  const encrypted = await this.bcryptService.encrypt('password');
  const isMatch = await this.bcryptService.compare('password', encrypted);
  console.log(isMatch); // true
}
```

#### compareSync (sync)

```typescript
compareSyncExample() {
  const encrypted = this.bcryptService.encryptSync('password');
  const isMatch = this.bcryptService.compareSync('password', encrypted);
  console.log(isMatch); // true
}
```

#### generatePasswordHash

Genera un hash seguro para una contraseña de forma sincrónica.

```typescript
generatePasswordHashExample() {
  const hash = this.bcryptService.generatePasswordHash('password');
  console.log(hash); // '$2b$16$...'
}
```

#### validateHash

Valida si un hash fue generado con las rondas actuales (útil para detectar hashes que conviene regenerar luego de subir
`rounds`). Lanza error si el string no es un hash bcrypt válido.

```typescript
validateHashExample() {
  const hash = this.bcryptService.generatePasswordHash('password');
  const isValid = this.bcryptService.validateHash(hash);
  console.log(isValid); // true
}
```

#### generateSalt

Genera y retorna una sal. Se ejecuta automáticamente en el constructor con los valores configurados. Si se llama con
valores custom, esos `rounds`/`minor` pasan a usarse en los hashes siguientes de esa instancia (cada hash sigue usando
su propia sal aleatoria).

```typescript
const salt = this.bcryptService.generateSalt(10, 'a'); // '$2a$10$…' (29 caracteres)
this.bcryptService.encryptSync('password'); // '$2a$10$...'
```

#### 📤 Ejemplos de salida y errores

```typescript
await this.bcryptService.encrypt('password');
// '$2b$16$…'  (60 caracteres: $<minor>$<rounds>$<sal+hash>)
await this.bcryptService.encrypt('password');
// '$2b$16$…'  (distinto al anterior: sal aleatoria por hash)
await this.bcryptService.compare('password', hash); // true
await this.bcryptService.compare('otra', hash); // false
await this.bcryptService.compare('password', 'no-es-un-hash'); // false
this.bcryptService.validateHash('no-es-un-hash');
// Error: Error validating hash: invalid hash provided
await this.bcryptService.encrypt(undefined as unknown as string);
// Error: Error encrypting data: data and salt arguments required
```

Todos los métodos envuelven los errores de `bcrypt` en un `Error` con prefijo descriptivo
(`Error generating salt: …`, `Error encrypting data: …`, `Error synchronously encrypting data: …`,
`Error comparing data: …`, `Error synchronously comparing data: …`, `Error generating password hash: …`,
`Error validating hash: …`).

---

<a name="api-reference"></a>

## 📖 API Reference

### Módulos

| Módulo         | Descripción                       | Global |
| -------------- | --------------------------------- | ------ |
| `RedactModule` | Ofuscamiento de datos sensibles   | Sí     |
| `FormatModule` | Formateo de números y fechas      | Sí     |
| `BcryptModule` | Encriptación y hashing con bcrypt | Sí     |

### Servicios

| Servicio        | Módulo         | Métodos                                                                                                                  |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `RedactService` | `RedactModule` | `obfuscate(data, serialize?)`                                                                                            |
| `FormatService` | `FormatModule` | `formatNumber()`, `dateTimeRef()`, `formatDate()`, `dateToISO()`, `calculateTimestampDiff()`                             |
| `BcryptService` | `BcryptModule` | `encrypt()`, `encryptSync()`, `compare()`, `compareSync()`, `generatePasswordHash()`, `validateHash()`, `generateSalt()` |

### Interfaces

| Interfaz                        | Descripción                                     |
| ------------------------------- | ----------------------------------------------- |
| `RedactOptions`                 | Opciones del módulo Redact                      |
| `RedactModuleOptions`           | Alias de `RedactOptions`                        |
| `RedactModuleOptionsFactory`    | Factory para opciones async de Redact           |
| `RedactModuleAsyncOptions`      | Opciones async para `registerAsync()`           |
| `BcryptOptions`                 | Opciones del módulo Bcrypt (`rounds`, `minor`)  |
| `FormatNumberOptions`           | Parámetros de `formatNumber()`                  |
| `FormatDateOptions`             | Parámetros de `formatDate()`                    |
| `ISOFormatDateOptions`          | Parámetros de `dateToISO()`                     |
| `CalculateTimestampDiffOptions` | Parámetros de `calculateTimestampDiff()`        |
| `TimestampDiffOptions`          | Sub-opciones de `CalculateTimestampDiffOptions` |

### Tipos y enums

| Símbolo         | Tipo | Valores / Descripción                                                                             |
| --------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `BcryptVersion` | type | `'a' \| 'b'`                                                                                      |
| `TimeUnit`      | type | `'milliseconds' \| 'seconds' \| 'minutes' \| 'hours' \| 'days' \| 'weeks' \| 'months' \| 'years'` |
| `TimeSuffixes`  | enum | `ms`, `s`, `min`, `h`, `d`, `w`, `mo`, `y`                                                        |

### Constantes

| Constante                                  | Valor                                                                                             | Descripción                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `DEFAULT_CENSOR`                           | `'****'`                                                                                          | Censor por defecto de Redact              |
| `DEFAULT_OPTIONS_REDACT`                   | `{ paths:[], obfuscateFrom:'right', censor:'****', remove:false, strict:false, serialize:false }` | Opciones por defecto de Redact            |
| `REDACT_MODULE_OPTIONS`                    | `Symbol`                                                                                          | Token de inyección de opciones del módulo |
| `REDACT_PROVIDER`                          | `Symbol`                                                                                          | Token del provider de fast-redact         |
| `DEFAULT_TIMEZONE`                         | `'utc'`                                                                                           | Zona horaria por defecto (UTC)            |
| `DEFAULT_LOCALE`                           | `'es-AR'`                                                                                         | Locale por defecto                        |
| `DEFAULT_TIMEZONE_LOCALE`                  | `'America/Argentina/Buenos_Aires'`                                                                | Zona horaria de Buenos Aires              |
| `DEFAULT_FORMAT_DATE`                      | `'dd/LL/yyyy TT.SSS'`                                                                             | Formato de fecha por defecto              |
| `DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF` | `{ unit: 'milliseconds', addSuffix: false }`                                                      | Opciones por defecto del cálculo de diff  |
| `DEFAULT_SALT_ROUNDS`                      | `16`                                                                                              | Rondas de sal por defecto de Bcrypt       |
| `DEFAULT_MINOR`                            | `'b'`                                                                                             | Versión menor por defecto de Bcrypt       |
| `BCRYPT_DEFAULT_OPTIONS`                   | `{ rounds: 16, minor: 'b' }`                                                                      | Opciones por defecto de Bcrypt            |
| `BCRYPT_MODULE_OPTIONS`                    | `Symbol`                                                                                          | Token de inyección de opciones de Bcrypt  |

---

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
