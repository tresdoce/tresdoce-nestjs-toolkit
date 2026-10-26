<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Snowflake-Uid</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/snowflake-uid.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Implementa la generación de IDs únicos distribuidos siguiendo el algoritmo
[Snowflake](https://en.wikipedia.org/wiki/Snowflake_ID) originalmente diseñado por Twitter. Cada ID es un entero de
63 bits (`bigint` o `string` decimal) que codifica marca de tiempo, worker ID, process ID y una secuencia incremental.

**¿Cuándo usarlo?** Cuando necesitás IDs únicos generados en la aplicación (sin depender de una secuencia de base de
datos), ordenables por fecha de creación y que no colisionen entre varias instancias/pods, siempre que cada instancia
tenga una combinación `workerId` + `processId` distinta. No requiere ningún servicio externo.

## Glosario

- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [🧬 Estructura del ID](#id-structure)
- [👨‍💻 Uso](#use)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.12 o superior ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 o superior ([Documentación](https://nestjs.com/))
- `@nestjs/config` con `ConfigModule.forRoot({ isGlobal: true })` registrado en la aplicación.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/snowflake-uid
```

```
yarn add @tresdoce-nestjs-toolkit/snowflake-uid
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente. El paquete es
**ESM-only** (`"type": "module"`).

<a name="configurations"></a>

## ⚙️ Configuración

El módulo lee la key `config.snowflakeUID` (`Typings.AppConfig['snowflakeUID']`) del `ConfigService`. Toda la
configuración es opcional: la que se provea se combina con `DEFAULT_SNOWFLAKE_MODULE_OPTIONS`, y los valores
`undefined` no pisan los valores por defecto.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    snowflakeUID: {
      // bigint, number o string numérico (por ejemplo, directo desde una variable de entorno)
      epoch: process.env.SNOWFLAKE_EPOCH ?? 1577836800000n,
      workerId: Number(process.env.SNOWFLAKE_WORKER_ID ?? 1),
      processId: Number(process.env.SNOWFLAKE_PROCESS_ID ?? 1),
      asString: process.env.SNOWFLAKE_AS_STRING?.toLowerCase() === 'true',
    },
    //...
  };
});
```

```dotenv
# .env
SNOWFLAKE_EPOCH=1577836800000
SNOWFLAKE_WORKER_ID=1
SNOWFLAKE_PROCESS_ID=1
SNOWFLAKE_AS_STRING=true
```

> ⚠️ Los valores se validan al crear el servicio (al iniciar la aplicación). Si `workerId` o `processId` no son
> enteros entre `0` y `31` (por ejemplo, `NaN` por una variable de entorno mal cargada), o si `epoch` no es un entero
> no negativo, la aplicación no arranca y se lanza un error descriptivo.

> 💡 En despliegues con varias réplicas, cada instancia **debe** tener un par `workerId`/`processId` único (por
> ejemplo, derivado del ordinal del pod de un StatefulSet). Dos instancias con el mismo par pueden generar IDs
> duplicados en el mismo milisegundo.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hacé clic acá.</summary>

`epoch`: Marca de tiempo base (en milisegundos) desde la cual se calculan los timestamps de los IDs. Acepta `bigint`,
`number` o un `string` numérico. Con 41 bits de timestamp, el generador funciona durante ~69 años desde el epoch (hasta
2089 con el valor por defecto).

- Type: `bigint | number | string`
- Required: `false`
- Default: `1577836800000n` (2020-01-01 00:00:00 UTC)

`workerId`: ID del worker (nodo) que genera los IDs.

- Type: `number` (entero)
- Required: `false`
- Default: `1`
- Rango válido: `0` a `31`

`processId`: ID del proceso dentro del worker.

- Type: `number` (entero)
- Required: `false`
- Default: `1`
- Rango válido: `0` a `31`

`asString`: Si es `true`, `generate()` devuelve el ID como `string` decimal en lugar de `bigint`. Recomendado si el ID
se va a serializar a JSON (`JSON.stringify` no soporta `bigint`).

- Type: `boolean`
- Required: `false`
- Default: `false`

`toString` _(deprecado)_: Alias de `asString`, mantenido por retrocompatibilidad. Si se definen ambos, gana `asString`.

- Type: `boolean`
- Required: `false`
- Default: `false`

</details>

<a name="id-structure"></a>

## 🧬 Estructura del ID

```
 0 | 41 bits: timestamp - epoch (ms) | 5 bits: workerId | 5 bits: processId | 12 bits: secuencia
63   62                           22   21             17   16             12   11               0
```

- **Secuencia por milisegundo**: dentro de un mismo milisegundo se incrementa la secuencia (`0` a `4095`); al cambiar
  de milisegundo vuelve a `0`. El estado (último timestamp y secuencia) se comparte entre todas las instancias de
  `SnowflakeService` del proceso, así que nunca emiten el mismo ID.
- **Overflow**: si se generan más de 4096 IDs en el mismo milisegundo, el servicio espera activamente (como mucho
  ~1 ms) al siguiente milisegundo. Si el milisegundo se pasó de forma explícita con `generate(date)` y está adelantado
  respecto al reloj, en lugar de bloquearse avanza al milisegundo siguiente.
- **Reloj que retrocede**: si el timestamp es menor al último usado (por ejemplo, un ajuste de NTP), se lanza
  `Invalid system clock: clock moved backwards <n>ms` en lugar de arriesgar IDs duplicados.
- **Rango**: un timestamp anterior al epoch, o más de 2⁴¹-1 ms posterior, lanza un error.

Ejemplo real de IDs generados con la configuración por defecto (`workerId: 1`, `processId: 1`) a las
`2026-10-26T12:00:00.000Z`:

| ID                   | timestamp       | workerId | processId | increment |
| -------------------- | --------------- | :------: | :-------: | :-------: |
| `902526979276935168` | `1793016000000` |    1     |     1     |     0     |
| `902526979276935169` | `1793016000000` |    1     |     1     |     1     |
| `902526979276935170` | `1793016000000` |    1     |     1     |     2     |
| `902526979281129472` | `1793016000001` |    1     |     1     |     0     |

```
902526979276935168 = 0 | 00011001000011001101011100000011000000000 | 00001 | 00001 | 000000000000
```

<a name="use"></a>

## 👨‍💻 Uso

### Importar el módulo

Importar el `SnowflakeModule` en el archivo `app.module.ts`. El módulo está marcado como `@Global()`, por lo que una
vez importado queda disponible en toda la aplicación.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SnowflakeModule } from '@tresdoce-nestjs-toolkit/snowflake-uid';

import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    //...
    SnowflakeModule,
    //...
  ],
})
export class AppModule {}
```

### Inyectar el servicio

```typescript
import { Injectable } from '@nestjs/common';
import {
  SnowflakeService,
  type SnowflakeParseResult,
} from '@tresdoce-nestjs-toolkit/snowflake-uid';

@Injectable()
export class OrdersService {
  constructor(private readonly snowflakeService: SnowflakeService) {}

  createOrderId(): string {
    // generate() devuelve string | bigint según `asString`; String() normaliza para persistir o serializar.
    return String(this.snowflakeService.generate());
  }

  getCreationDate(id: string): Date {
    const { timestamp }: SnowflakeParseResult = this.snowflakeService.parse(id);
    return new Date(timestamp);
  }
}
```

### Ejemplo con un controller

```typescript
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { SnowflakeService } from '@tresdoce-nestjs-toolkit/snowflake-uid';

@Controller('ids')
export class IdsController {
  constructor(private readonly snowflakeService: SnowflakeService) {}

  @Get('generate')
  generate() {
    return { id: String(this.snowflakeService.generate()) };
  }

  @Get('parse/:id')
  parse(@Param('id') id: string) {
    if (!this.snowflakeService.isSnowflake(id)) {
      throw new BadRequestException('ID inválido');
    }
    const parsed = this.snowflakeService.parse(id);
    return { id, ...parsed, date: new Date(parsed.timestamp).toISOString() };
  }
}
```

Respuesta de `GET /ids/generate`:

```json
{ "id": "902526979285610496" }
```

Respuesta de `GET /ids/parse/902526979285610496` (generado con `workerId: 3`, `processId: 7`):

```json
{
  "id": "902526979285610496",
  "timestamp": 1793016000002,
  "workerId": 3,
  "processId": 7,
  "increment": 0,
  "date": "2026-10-26T12:00:00.002Z"
}
```

<a name="api-reference"></a>

## 📖 API Reference

### `SnowflakeModule`

Módulo `@Global()` que registra `SnowflakeService` y el provider `SNOWFLAKE_MODULE_OPTIONS` (opciones ya combinadas con
los defaults) a partir de `config.snowflakeUID`. Exporta ambos.

### `SnowflakeService`

#### `generate(date?: Date): string | bigint`

Genera un nuevo ID Snowflake. Devuelve `string` si `asString` es `true`; si no, `bigint`.

| Parámetro | Tipo   | Requerido |   Default    | Descripción                          |
| --------- | ------ | :-------: | :----------: | ------------------------------------ |
| `date`    | `Date` |    No     | `new Date()` | Fecha base para la generación del ID |

Lanza un `Error` si:

- El timestamp es anterior al epoch: `Invalid system clock: timestamp is before epoch`.
- El timestamp es menor al último usado en el proceso: `Invalid system clock: clock moved backwards <n>ms`.
- El timestamp supera el rango de 41 bits: `Invalid system clock: timestamp exceeds the 41-bit range of the epoch`.

> ⚠️ Como el generador es monotónico, `generate(date)` con una fecha **anterior** a un ID ya generado en el proceso
> lanza el error de reloj. Pasar una fecha sirve para fechas actuales o futuras, no para generar IDs "históricos".

```typescript
snowflakeService.generate(); // 902526979276935168n (asString = false)
snowflakeService.generate(); // '902526979276935169' (asString = true)
```

#### `isSnowflake(id: string | bigint): id is Snowflake`

Devuelve `true` si el valor es un entero cuyo timestamp es posterior al epoch configurado y no está en el futuro.
Devuelve `false` si no puede convertirse a `bigint` (`'abc'`, `'1.5'`), si es negativo o si el timestamp queda fuera de
ese rango. No verifica que el `workerId`/`processId` coincidan con los de la instancia (un ID de otro nodo es válido).

```typescript
snowflakeService.isSnowflake('902526979285610496'); // true
snowflakeService.isSnowflake('123456'); // false (timestamp = epoch)
snowflakeService.isSnowflake('abc'); // false
```

#### `parse(snowflake: string | bigint): SnowflakeParseResult`

Descompone un ID en sus partes, usando el epoch configurado. No valida el ID: usá `isSnowflake()` antes si viene de
una fuente externa. Lanza `SyntaxError` si el string no es un entero.

```typescript
snowflakeService.parse('902526979276935169');
// { timestamp: 1793016000000, workerId: 1, processId: 1, increment: 1 }
```

---

### Constantes exportadas

| Constante                          | Tipo               | Valor            | Descripción                                        |
| ---------------------------------- | ------------------ | ---------------- | -------------------------------------------------- |
| `SNOWFLAKE_MODULE_OPTIONS`         | `symbol`           | —                | Token de inyección de las opciones del módulo      |
| `DEFAULT_SNOWFLAKE_MODULE_OPTIONS` | `SnowFlakeOptions` | —                | Opciones por defecto                               |
| `DEFAULT_EPOCH`                    | `bigint`           | `1577836800000n` | Epoch por defecto (2020-01-01 00:00:00 UTC en ms)  |
| `DEFAULT_WORKER_ID`                | `number`           | `1`              | Worker ID por defecto                              |
| `DEFAULT_PROCESS_ID`               | `number`           | `1`              | Process ID por defecto                             |
| `DEFAULT_TO_STRING`                | `boolean`          | `false`          | Valor por defecto de `asString`                    |
| `TIMESTAMP_BITS`                   | `number`           | `41`             | Bits reservados para el timestamp                  |
| `WORKER_ID_BITS`                   | `number`           | `5`              | Bits reservados para el worker ID                  |
| `PROCESS_ID_BITS`                  | `number`           | `5`              | Bits reservados para el process ID                 |
| `SEQUENCE_BITS`                    | `number`           | `12`             | Bits reservados para la secuencia                  |
| `MAX_WORKER_ID`                    | `number`           | `31`             | Valor máximo de `workerId`                         |
| `MAX_PROCESS_ID`                   | `number`           | `31`             | Valor máximo de `processId`                        |
| `SEQUENCE_MASK`                    | `number`           | `4095`           | Máscara de la secuencia                            |
| `MAX_TIMESTAMP_OFFSET`             | `bigint`           | `2199023255551n` | Máximo `timestamp - epoch` representable (41 bits) |

---

### Interfaces y tipos exportados

#### `SnowFlakeOptions`

| Propiedad   | Tipo                         | Requerido |     Default      | Descripción                                  |
| ----------- | ---------------------------- | :-------: | :--------------: | -------------------------------------------- |
| `epoch`     | `bigint \| number \| string` |    No     | `1577836800000n` | Epoch base en milisegundos                   |
| `workerId`  | `number`                     |    No     |       `1`        | ID del worker (0–31)                         |
| `processId` | `number`                     |    No     |       `1`        | ID del proceso (0–31)                        |
| `asString`  | `boolean`                    |    No     |     `false`      | Si es `true`, `generate()` devuelve `string` |
| `toString`  | `boolean`                    |    No     |     `false`      | **Deprecado**: alias de `asString`           |

> Si instanciás `SnowflakeService` manualmente (sin el módulo), `workerId` y `processId` son obligatorios: no se
> aplican los defaults.

#### `SnowflakeParseResult`

| Campo       | Tipo     | Descripción                                     |
| ----------- | -------- | ----------------------------------------------- |
| `timestamp` | `number` | Timestamp Unix (ms) de generación del ID        |
| `workerId`  | `number` | ID del worker que generó el ID (0–31)           |
| `processId` | `number` | ID del proceso que generó el ID (0–31)          |
| `increment` | `number` | Secuencia dentro del mismo milisegundo (0–4095) |

#### `Snowflake`

Template literal type `` `${bigint}` `` que representa un ID como string de dígitos. Es el tipo al que estrecha
`isSnowflake()`.

```typescript
import type { Snowflake } from '@tresdoce-nestjs-toolkit/snowflake-uid';

function findOrder(id: Snowflake) {
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
