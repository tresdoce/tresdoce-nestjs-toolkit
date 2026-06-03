<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Snowflake-Uid</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/snowflake-uid.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Implementa la generación de IDs únicos distribuidos siguiendo el algoritmo
[Snowflake](https://en.wikipedia.org/wiki/Snowflake_ID) originalmente diseñado por Twitter. Los IDs son `bigint` de
64 bits que codifican marca de tiempo, worker ID, process ID y un número de secuencia incremental.

## Glosario

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
npm install -S @tresdoce-nestjs-toolkit/snowflake-uid
```

```
yarn add @tresdoce-nestjs-toolkit/snowflake-uid
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar la configuración del generador de Snowflake en `configuration.ts` utilizando el key `snowflakeUID`.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    snowflakeUID: {
      epoch: BigInt(process.env.SNOWFLAKE_EPOCH) || 1577836800000n,
      workerId: parseInt(process.env.SNOWFLAKE_WORKER_ID, 10) || 1,
      processId: parseInt(process.env.SNOWFLAKE_PROCESS_ID, 10) || 1,
      toString: process.env.SNOWFLAKE_TO_STRING?.toLowerCase() === 'true',
    },
    //...
  };
});
```

Si no se provee configuración, el módulo utiliza los valores por defecto definidos en `DEFAULT_SNOWFLAKE_MODULE_OPTIONS`.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`epoch`: Marca de tiempo base (en milisegundos) desde la cual se computan los timestamps de los IDs generados.
Corresponde al epoch personalizado del sistema. El valor por defecto es `1577836800000n` (2020-01-01 00:00:00 UTC).

- Type: `BigInt`
- Required: `false`
- Default: `1577836800000n`

`workerId`: ID del worker (nodo) que genera los IDs. Debe estar en el rango `0–31`. Si el valor es inválido o no
está definido, el servicio lanza una excepción al inicializarse.

- Type: `Number`
- Required: `false`
- Default: `1`
- Rango válido: `0` a `31`

`processId`: ID del proceso dentro del worker. Debe estar en el rango `0–31`. Si el valor es inválido o no está
definido, el servicio lanza una excepción al inicializarse.

- Type: `Number`
- Required: `false`
- Default: `1`
- Rango válido: `0` a `31`

`toString`: Si es `true`, `generate()` devuelve el ID como `string` en lugar de `bigint`.

- Type: `Boolean`
- Required: `false`
- Default: `false`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importar el módulo

Importar el `SnowflakeModule` en el archivo `app.module.ts`. El módulo está marcado como `@Global()`, por lo que una
vez importado queda disponible en toda la aplicación.

```typescript
//./src/app.module.ts
import { SnowflakeModule } from '@tresdoce-nestjs-toolkit/snowflake-uid';

@Module({
  imports: [
    //...
    SnowflakeModule,
    //...
  ],
})
export class AppModule {}
```

### Inyectar el servicio

Inyectar `SnowflakeService` en cualquier provider para generar, validar y parsear IDs Snowflake.

```typescript
import { Injectable } from '@nestjs/common';
import { SnowflakeService } from '@tresdoce-nestjs-toolkit/snowflake-uid';

@Injectable()
export class MyService {
  constructor(private readonly snowflakeService: SnowflakeService) {}

  generateId(): string | bigint {
    return this.snowflakeService.generate();
  }

  generateIdForDate(date: Date): string | bigint {
    return this.snowflakeService.generate(date);
  }

  validateId(id: string | bigint): boolean {
    return this.snowflakeService.isSnowflake(id);
  }

  parseId(id: string | bigint) {
    return this.snowflakeService.parse(id);
  }
}
```

### Ejemplo de uso completo

```typescript
import { Controller, Get } from '@nestjs/common';
import { SnowflakeService } from '@tresdoce-nestjs-toolkit/snowflake-uid';

@Controller('ids')
export class IdsController {
  constructor(private readonly snowflakeService: SnowflakeService) {}

  @Get('generate')
  generate() {
    const id = this.snowflakeService.generate();
    return { id: id.toString() };
  }

  @Get('parse/:id')
  parse(@Param('id') id: string) {
    if (!this.snowflakeService.isSnowflake(id)) {
      throw new BadRequestException('ID inválido');
    }
    return this.snowflakeService.parse(id);
    // { timestamp: 1704067200123, workerId: 1, processId: 1, increment: 0 }
  }
}
```

<a name="api-reference"></a>

## 📖 API Reference

### `SnowflakeService`

Servicio principal para generar y manipular IDs Snowflake.

#### `generate(date?: Date): string | bigint`

Genera un nuevo ID Snowflake único. El tipo de retorno depende del valor de `toString` en la configuración:
`string` si es `true`, `bigint` si es `false`.

| Parámetro | Tipo   | Requerido |   Default    | Descripción                          |
| --------- | ------ | :-------: | :----------: | ------------------------------------ |
| `date`    | `Date` |    No     | `new Date()` | Fecha base para la generación del ID |

Lanza un error si:

- El timestamp resultante es anterior al epoch configurado (`Invalid system clock: timestamp is before epoch`).
- El reloj del sistema retrocede por debajo del último timestamp generado (`Invalid system clock`).

```typescript
const id = snowflakeService.generate();
// bigint: 7305427696193658880n  (si toString = false)
// string: '7305427696193658880' (si toString = true)

const idForDate = snowflakeService.generate(new Date('2024-01-01'));
```

#### `isSnowflake(id: string | bigint): id is Snowflake`

Valida si el valor proporcionado es un ID Snowflake válido generado con la configuración actual (epoch, workerId,
processId). Es un type guard de TypeScript: si devuelve `true`, el tipo se estrecha a `Snowflake`.

| Parámetro | Tipo               | Requerido | Descripción  |
| --------- | ------------------ | :-------: | ------------ |
| `id`      | `string \| bigint` |    Si     | ID a validar |

Devuelve `false` si el ID no puede convertirse a `bigint`, si el timestamp está fuera del rango válido, o si el
workerId, processId o secuencia son inválidos.

```typescript
snowflakeService.isSnowflake('7305427696193658880'); // true
snowflakeService.isSnowflake('123456'); // false
snowflakeService.isSnowflake(123456n); // false
```

#### `parse(snowflake: string | bigint): SnowflakeParseResult`

Descompone un ID Snowflake en sus partes constitutivas.

| Parámetro   | Tipo               | Requerido | Descripción      |
| ----------- | ------------------ | :-------: | ---------------- |
| `snowflake` | `string \| bigint` |    Si     | ID a descomponer |

Devuelve un objeto `SnowflakeParseResult`:

| Campo       | Tipo     | Descripción                                               |
| ----------- | -------- | --------------------------------------------------------- |
| `timestamp` | `number` | Timestamp Unix (en ms) en que se generó el ID             |
| `workerId`  | `number` | ID del worker que generó el ID (0–31)                     |
| `processId` | `number` | ID del proceso que generó el ID (0–31)                    |
| `increment` | `number` | Número de secuencia dentro del mismo milisegundo (0–4095) |

```typescript
const result = snowflakeService.parse('7305427696193658880');
// {
//   timestamp: 1704067200123,
//   workerId:  1,
//   processId: 1,
//   increment: 0,
// }
```

---

### Constantes exportadas

Todas las constantes son re-exportadas desde `@tresdoce-nestjs-toolkit/snowflake-uid`.

| Constante                          | Tipo               | Valor            | Descripción                                         |
| ---------------------------------- | ------------------ | ---------------- | --------------------------------------------------- |
| `DEFAULT_EPOCH`                    | `bigint`           | `1577836800000n` | Epoch por defecto (2020-01-01 00:00:00 UTC en ms)   |
| `DEFAULT_WORKER_ID`                | `number`           | `1`              | Worker ID por defecto                               |
| `DEFAULT_PROCESS_ID`               | `number`           | `1`              | Process ID por defecto                              |
| `DEFAULT_TO_STRING`                | `boolean`          | `false`          | Indica si se devuelve el ID como string por defecto |
| `WORKER_ID_BITS`                   | `number`           | `5`              | Bits reservados para el worker ID                   |
| `PROCESS_ID_BITS`                  | `number`           | `5`              | Bits reservados para el process ID                  |
| `SEQUENCE_BITS`                    | `number`           | `12`             | Bits reservados para la secuencia                   |
| `MAX_WORKER_ID`                    | `number`           | `31`             | Valor máximo permitido para workerId                |
| `MAX_PROCESS_ID`                   | `number`           | `31`             | Valor máximo permitido para processId               |
| `SEQUENCE_MASK`                    | `number`           | `4095`           | Máscara de bits para la secuencia                   |
| `SNOWFLAKE_MODULE_OPTIONS`         | `Symbol`           | —                | Token de inyección de las opciones del módulo       |
| `DEFAULT_SNOWFLAKE_MODULE_OPTIONS` | `SnowFlakeOptions` | —                | Opciones por defecto completas del módulo           |

---

### Interfaces y tipos exportados

#### `SnowFlakeOptions`

Opciones de configuración del módulo.

| Propiedad   | Tipo      | Requerido |     Default      | Descripción                                  |
| ----------- | --------- | :-------: | :--------------: | -------------------------------------------- |
| `epoch`     | `bigint`  |    Si     | `1577836800000n` | Epoch base en milisegundos                   |
| `workerId`  | `number`  |    No     |       `1`        | ID del worker (0–31)                         |
| `processId` | `number`  |    No     |       `1`        | ID del proceso (0–31)                        |
| `toString`  | `boolean` |    No     |     `false`      | Si es `true`, `generate()` devuelve `string` |

#### `SnowflakeParseResult`

Resultado devuelto por `parse()`.

| Campo       | Tipo     | Descripción                              |
| ----------- | -------- | ---------------------------------------- |
| `timestamp` | `number` | Timestamp Unix (ms) de generación del ID |
| `workerId`  | `number` | ID del worker que generó el ID           |
| `processId` | `number` | ID del proceso que generó el ID          |
| `increment` | `number` | Número de secuencia (0–4095)             |

#### `Snowflake`

Template literal type que representa un ID Snowflake como string: `` `${bigint}` ``. Úsalo para estrechar tipos cuando
`isSnowflake()` devuelve `true`.

```typescript
import { Snowflake } from '@tresdoce-nestjs-toolkit/snowflake-uid';

function processId(id: Snowflake) {
  // id está garantizado como un string de dígitos que representa un bigint válido
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
