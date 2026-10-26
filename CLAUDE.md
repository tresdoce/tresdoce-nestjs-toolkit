# tresdoce-nestjs-toolkit — LLM Context

This file is machine-readable context for AI assistants working in this codebase. It is meant to be loaded once at the start of a session so the assistant does not need to re-read every file.

---

## 1. Project overview

A NestJS monorepo that publishes ~25 independent **ESM-only** packages to npm under the `@tresdoce-nestjs-toolkit` scope. All packages are designed to be consumed by [nestjs-starter](https://github.com/rudemex/nestjs-starter) or any project that follows its centralized-config architecture.

| Dimension              | Detail                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                | Node.js 22 (>= 22.22), 24 (default) and 26 — CI matrix and gulpfile.js. OpenTelemetry 3 needs >= 22.15 and testcontainers 12.2 needs >= 22.22 |
| Module system          | ESM only (`"type": "module"`, TS `module: nodenext`)                                                                                          |
| Framework              | NestJS 12.x (`@nestjs/common`, `@nestjs/core`, etc.)                                                                                          |
| Language               | TypeScript 6.x                                                                                                                                |
| Package manager        | Yarn 1.22.22 (classic workspaces)                                                                                                             |
| Monorepo orchestration | Lerna 10 + Turbo 2                                                                                                                            |
| Build tool             | `tsc` + `scripts/build-dist-package.mjs`                                                                                                      |
| Tests / lint           | Vitest 5 (coverage: istanbul) / oxlint                                                                                                        |
| Env validation         | Zod (default) via Standard Schema; Joi kept as deprecated `*Joi` exports                                                                      |
| Commit style           | Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`)                                                                     |

Packages live under `packages/<name>/src/`. Published artifacts are placed at `dist/<name>/` from the repo root.

---

## 2. Centralized config pattern (most critical)

Every module in this toolkit reads its configuration from a single `ConfigService` key: `'config'`. The shape of that key is `Typings.AppConfig` defined in `packages/core/src/typings/index.ts`.

### How the host application registers config

```typescript
// In the consuming app (e.g., nestjs-starter)
import { registerAs } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

export default registerAs('config', (): Typings.AppConfig => ({
  project: { ... },
  server: { ... },
  swagger: { ... },
  redis: { ... },   // optional — RedisModule activates only if present
  // etc.
}));
```

`ConfigModule` must be imported with `isGlobal: true` in the host `AppModule`.

### AppConfig shape (abbreviated)

```typescript
// packages/core/src/typings/index.ts
export interface AppConfig {
  project: IProjectConfig; // required
  server: IServerConfig; // required
  swagger: ISwaggerConfig; // required
  health?: IHealthConfig; // optional
  params?: IParamsConfig; // optional
  httpClient?: IHttpClientConfig; // optional → HttpClientModule
  services?: Record<string, IServicesConfig>; // optional
  database?: DatabaseOptions; // optional → TypeOrmClientModule (key: 'config.database.typeorm')
  redis?: RedisOptions; // optional → RedisModule
  mailer?: MailerOptions; // optional → MailerModule
  camunda?: CamundaOptions; // optional → CamundaModule
  elasticsearch?: ElasticsearchOptions; // optional → ElkModule
  tracing?: TracingOptions; // optional → TracingModule
  redact?: RedactOptions; // optional → RedactModule
  bcrypt?: BcryptOptions; // optional → BcryptModule
  snowflakeUID?: SnowFlakeOptions; // optional → SnowFlakeModule
  sqs?: AwsSqsModuleOptions; // optional → AwsSqsModule
  [key: string]: any;
}
```

### Module activation rule

A module that reads an optional config key (e.g., `redis`) is **only** active when that key is populated in the config object. There is no runtime guard in the modules themselves; if the key is absent `ConfigService.get('config.redis')` returns `undefined`, and the module either fails or no-ops depending on its provider factory.

### Example: how modules read from ConfigService

```typescript
// Typical pattern in any package module
{
  provide: MODULE_OPTIONS_TOKEN,
  useFactory: async (configService: ConfigService) =>
    configService.get<FeatureOptions>('config.<featureKey>'),
  inject: [ConfigService],
}
```

The `health` and `archetype` modules read the entire `AppConfig` object:

```typescript
configService.get<Typings.AppConfig>('config');
```

---

## 3. Package dependency graph

Internal dependencies only (excludes NestJS peer deps and third-party libs):

```
core         ← base (no internal deps)
utils        ← base (no internal deps; contains RedactModule, FormatModule, BcryptModule)
filters      ← core
tracing      ← core (Typings), utils (FormatService); OpenTelemetry 3.x
elk          ← core (excludePaths), filters (buildErrorPayload), utils (RedactModule, FormatService, RedactService)
archetype    ← core (Typings.AppConfig)
health       ← core (Public, Typings), tracing (SkipTrace); uses @nestjs/terminus 12 and ioredis (Redis ping)
http-client  ← core (Typings.IHttpClientConfig)
response-parser ← (no internal deps)
rate-limit   ← (no internal deps; re-exports @nestjs/throttler)
redis        ← (no internal deps)
typeorm      ← (no internal deps; wraps @nestjs/typeorm)
logger       ← core (excludePaths), utils (RedactModule, FormatService); pino
auth         ← core (IS_PUBLIC_KEY), redis (refresh tokens)
paas         ← core, filters, health, logger, rate-limit, response-parser, tracing, utils

Standalone (no internal deps):
  aws-sqs, camunda, commons, database (Mongo), dynamoose, kafka, mailer, qrcode, snowflake-uid, test-utils
```

Key facts:

- `paas` depends on `rate-limit` but does **not** re-export it. Consuming apps must import `RateLimitModule` separately if needed standalone.
- `elk` declares `core`, `filters` and `utils` as direct dependencies (it imports `excludePaths` and `buildErrorPayload` at runtime).
- Every package must declare every module its `src` imports at runtime (including `@nestjs/config`); type-only imports of sibling packages from `core/src/typings` are the accepted exception.
- `ExceptionsFilter` can be registered with `{ provide: APP_FILTER, useClass: ExceptionsFilter }` (it optionally injects `ConfigService` and reads `'config'`), or instantiated with `new ExceptionsFilter(appConfig)`.
- `health` does NOT internally depend on `tracing`; `paas` depends on both independently.
- `commons` is a dev-tooling package for apps: `vitestConfig()` and an oxlint preset (`oxlint/oxlintrc.json`) — it is not a runtime dep.
- `config` is a dev-tooling package (shared `tsconfig.json`, Vitest base config/setup/plugins) — it is only in `devDependencies`.
- `tresdoce-types` is a global TypeScript types package — only in `devDependencies` as `@types/tresdoce-nestjs-toolkit`.

---

## 4. Module patterns

### Standard file layout (inside `packages/<name>/src/<name>/`)

```
<name>.module.ts          — DynamicModule or bare @Module
services/
  <name>.service.ts       — main service
constants/
  <name>.constant.ts      — injection tokens and string constants
interfaces/
  <name>.interface.ts     — option types exported publicly
interceptors/             — (optional) NestJS interceptors
controllers/              — (optional) NestJS controllers
providers/                — (optional) factory providers
decorators/               — (optional) custom decorators
```

Public API is `src/index.ts`, which uses named exports only (no barrel-via-wildcard for modules).

### Injection token convention

Tokens use `Symbol()` (not `Symbol.for()`):

```typescript
export const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
export const CONFIG_OPTIONS = Symbol('CONFIG_OPTIONS'); // archetype, health
```

### DynamicModule pattern (modules that accept direct options)

```typescript
@Global()
@Module({ ... })
export class XModule {
  // Used when config comes from ConfigService (default in toolkit apps)
  // The bare @Module providers factory reads from ConfigService directly.

  // Used when caller wants to pass options explicitly (e.g., tests)
  static register(options: XOptions): DynamicModule { ... }

  // Used for async factory / existing providers
  static registerAsync(options: XAsyncOptions): DynamicModule { ... }
}
```

Modules that are always @Global: `RedisModule`, `ElkModule`, `HttpClientModule`, `TracingModule`, `ArchetypeModule`, `HealthModule`, `TypeOrmClientModule`.

### Bare @Module pattern (no register/registerAsync)

Some modules do not expose `register()` — they are simply imported and always read from ConfigService. Examples: `HealthModule`, `ArchetypeModule`, `TracingModule`.

---

## 5. Key conventions

### Globals — import only once

All `@Global()` modules need to be imported only once in `AppModule`. Importing them again in a feature module does not cause duplicate registration in NestJS, but it is unnecessary and should be avoided.

### CONFIG_OPTIONS token

Several packages (archetype, health) use `CONFIG_OPTIONS = Symbol('CONFIG_OPTIONS')` to inject the full `Typings.AppConfig` into controllers/services. This is distinct from the `MODULE_OPTIONS` tokens used by data-source modules (redis, elk, typeorm).

### Environment validation (Zod)

`@nestjs/config` 12 validates `validationSchema` through Standard Schema (`schema['~standard'].validate`), so a Zod schema plugs in directly. `core` exports:

```typescript
import { z } from 'zod';
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/paas';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: validateSchemaForApp({
    ...validationSchemaCsrf, // CSRF_SECRET: optional, required + format-checked when APP_STAGE=prod
    RICK_AND_MORTY_API_URL: z.url(),
  }),
});
```

- `baseValidationSchema` / `baseValidationSchemaApp` are `z.ZodRawShape`s (spread them).
- Use `zBooleanFromEnv()` for env booleans (`'false'` → `false`; `z.coerce.boolean()` would return `true`) and `zNumberFromEnv()` for numbers.
- The Joi versions are still exported with a `Joi` suffix (`validateSchemaForAppJoi`, ...) and marked `@deprecated`. Joi 18 also implements Standard Schema, so they keep working.

### Build output

Each package builds to `../../dist/<name>` relative to its own directory, i.e., `<repo-root>/dist/<name>/`. The `publishConfig.directory` field in each `package.json` points to the same path. Consumers should never import from `dist/` — they import from the npm package name.

### TypeScript config

Every package extends `@tresdoce-nestjs-toolkit/config` (i.e., `packages/config/tsconfig.json`). Key flags: `module`/`moduleResolution: nodenext`, `isolatedModules: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`, `strictNullChecks: false`, `strict: false`. Each package has `tsconfig.json` (IDE + tests) and `tsconfig.build.json` (excludes tests, emits to `../../dist/<name>`).

### ESM rules (enforced by tsc / Node at runtime)

- Relative imports need the `.js` extension (`'./foo.js'`, `'./dir/index.js'`).
- Types re-exported from an index must use `export type { ... }` (TS1205).
- Types used in a decorated constructor (`@Inject(TOKEN) opts: SomeOptions`) must be imported with `import type` (TS1272). The same applies to `Typings` from core: always `import type { Typings }` (or `{ type Typings }`), otherwise Vite/oxc emits a runtime reference to it.
- CommonJS dependencies: Node only exposes the named exports its lexer detects. When a named import fails at runtime (e.g. `ejs.compile`, `dynamoose.aws`, `camunda.Variables`), use the default import. `dist/` can be smoke-tested in plain Node (see section 6).
- Deep imports into packages without an `exports` map need the file extension (`'dynamoose/dist/General.js'`). Nest 12 packages expose `./*`; types not exported from the root (e.g. `HttpArgumentsHost`) live in `@nestjs/common/internal` — prefer `ReturnType<ExecutionContext['switchToHttp']>`.
- No `__dirname`/`require`: use `import.meta.dirname` and `import`.

### Test file locations

- Unit/integration tests live in `src/__test__/` with `.spec.ts` extension.
- Each package has a `vitest.config.ts` that merges `@tresdoce-nestjs-toolkit/config/vitest` (`packages/config/vitest.config.base.ts`).
- Included files: `src/**/*.{spec,it,test,e2e,e2e-spec}.ts`. Globals (`describe`, `it`, `vi`) are enabled.
- Coverage threshold: 100% for branches, functions, lines, and statements (istanbul provider).
- `packages/config/vitest.plugins.ts` excludes the decorator helpers emitted by oxc (`_decorate(...)`) from coverage; without it every decorated class reports an uncovered `typeof X === "undefined"` branch.
- Vitest differences that bit during the migration: `clearMocks` is forced to `false` (Vitest 5 defaults to `true`); `vi.fn()` used with `new` needs a `function` implementation (not an arrow); variables used inside `vi.mock` factories must come from `vi.hoisted`; no `done()` callbacks; assertions must live inside `it`.
- Vitest keeps a transform cache in `node_modules/.vitest-cache`; delete it after changing Vite plugins.

---

## 6. Build system

```
yarn build
  └─ prebuild: rimraf ./dist        (root-level)
  └─ turbo run build --concurrency=1
       └─ per-package: prebuild: rimraf ../../dist/<name>
                       build: tsc -p tsconfig.build.json && node ../../scripts/build-dist-package.mjs
```

`tsc` emits ESM `.js` + `.d.ts` into `dist/<name>` (tests excluded by `tsconfig.build.json`). `scripts/build-dist-package.mjs` then writes the published `package.json` (`"type": "module"`, `exports` with `types`/`default`), copies README/CHANGELOG/license and any non-TS asset under `src/` (e.g. `test-utils` docker-compose.yml).

To smoke-test the published output in plain Node (no TS, no Vitest): symlink `dist/node_modules/@tresdoce-nestjs-toolkit/<name>` → `dist/<name>` and `import()` every package from a script inside `dist/`. This catches CommonJS named-import errors that tsc and Vitest do not.

---

## 7. Testing

### Root-level

```bash
yarn test   # turbo run test --concurrency=1 across all packages
```

### Per-package

```bash
yarn test          # vitest run --coverage
yarn test:watch    # vitest
```

### Integration tests with testcontainers

Tests that require real infrastructure (Redis, PostgreSQL, DynamoDB, Elasticsearch, Kafka) use the `testcontainers` library. Docker must be running. `kafka` starts Kafka (KRaft) + Schema Registry with testcontainers (`@testcontainers/kafka`) on a private network in `packages/kafka/vitest.globalSetup.ts`, and passes their real addresses to the tests with Vitest `provide`/`inject` (`kafkaBroker`, `schemaRegistryUrl`). Tests must never rely on a `docker` hostname: it only resolves on machines with a hosts entry, not on CI runners.

The `test-utils` package provides:

- `config` — a pre-built `registerAs('config', ...)` fixture (`appConfigBase`) conforming to `Typings.AppConfig`
- `testContainers` — helpers to start/stop containers in tests (`ITestContainerOptions`)
- `VitestFN` — Vitest mock helpers (`JestFN` is kept as a deprecated alias)
- `createMock(options)` — creates a `nock` HTTP interceptor for unit testing HTTP calls
- `cleanAllMock()` — clears all nock interceptors

```typescript
import {
  config,
  testContainers,
  VitestFN,
  createMock,
  cleanAllMock,
} from '@tresdoce-nestjs-toolkit/test-utils';
```

The `config` export is used in test modules:

```typescript
ConfigModule.forFeature(config); // registers 'config' key with appConfigBase
```

---

## 8. Common gotchas

### paas re-exports

`packages/paas/src/index.ts` re-exports:

```typescript
export * from '@tresdoce-nestjs-toolkit/core';
export * from '@tresdoce-nestjs-toolkit/filters';
export * from '@tresdoce-nestjs-toolkit/health';
export * from '@tresdoce-nestjs-toolkit/response-parser';
export * from '@tresdoce-nestjs-toolkit/tracing';
export * from '@tresdoce-nestjs-toolkit/utils';
```

`rate-limit` is a **dependency** of `paas` but is **NOT re-exported**. Applications must import `RateLimitModule` from `@tresdoce-nestjs-toolkit/rate-limit` separately.

### TerminusModule and health indicators

`@nestjs/terminus` v12 provides and exports all built-in health indicators (`HttpHealthIndicator`, `TypeOrmHealthIndicator`, `MicroserviceHealthIndicator`, etc.) directly from `TerminusModule`. Do NOT add them as explicit providers in `HealthModule` or application modules — they are already provided by `TerminusModule`.

### REQUEST-scoped interceptors

Both `TracingInterceptor` (`@Injectable({ scope: Scope.REQUEST })`, keeps no per-request state on the instance; `otelProvider()` returns the `NodeSDK` so apps can call `sdk.shutdown()`) and `HttpClientInterceptor` (`@Injectable({ scope: Scope.REQUEST })`) are request-scoped. This means any provider that injects them will also become request-scoped, propagating up the dependency tree. Be aware of this when adding these interceptors as providers.

### ElkService static config caching

`ElkService` reads `application`, `applicationVersion`, and `appStage` from `ConfigService` **once in the constructor** and stores them as private instance properties. These values are not re-read per request. If config changes at runtime (unlikely), these cached values will not update.

### RedisService.set() TTL guard

```typescript
// The guard is: Number.isFinite(seconds) && seconds > 0
// NOT: if (seconds) — because 0 is falsy but Number.isFinite(0) is true
public async set(key: string, value: any, seconds?: number): Promise<any> {
  const stringValue = JSON.stringify(value);
  return Number.isFinite(seconds) && seconds > 0
    ? await this.clientRef.setEx(key, seconds, stringValue)
    : await this.clientRef.set(key, stringValue);
}
```

Passing `seconds = 0` falls through to a plain `set` (no expiry). Passing `seconds = -1` or `NaN` also falls through.

### TypeORM config key

TypeORM reads from `config.database.typeorm`, not `config.database`:

```typescript
configService.get<TypeOrmModuleOptions>('config.database.typeorm');
```

The `AppConfig.database` key is typed as `DatabaseOptions` (from `@tresdoce-nestjs-toolkit/typeorm`), which wraps `TypeOrmModuleOptions` at the `.typeorm` sub-key.

### Injection token shape

All tokens use `Symbol()`, NOT `Symbol.for()`. This means tokens are NOT shared across module boundaries via the global Symbol registry — each package's tokens are module-local.

---

## 9. How to add a new package

```bash
yarn plop   # interactive scaffolding via plopfile.js at repo root
```

After scaffolding:

1. Add the new package row to the toolkit table in the root `README.md` (above the `<!---PLOP-TOOLKIT-TABLE-->` marker).
2. Add its options type import to `packages/core/src/typings/index.ts`.
3. Add the corresponding optional key to the `AppConfig` interface in `packages/core/src/typings/index.ts`.
4. If the package is a cross-cutting concern (not feature-specific), add it to `packages/paas/src/index.ts` re-exports and `packages/paas/package.json` dependencies.
5. Add the package to `lerna.json` (usually auto-detected from `packages/*` glob) and ensure `turbo.json` pipeline covers it.
6. Run `yarn install` from repo root to link workspace dependencies.

---

## 10. Package version reference (as of this file's creation)

| Package         | Version            |
| --------------- | ------------------ |
| core            | 2.0.11             |
| utils           | 2.0.11             |
| filters         | 2.0.11             |
| tracing         | 2.0.11             |
| elk             | 2.0.11             |
| archetype       | (see package.json) |
| health          | 2.0.12             |
| http-client     | (see package.json) |
| response-parser | 2.0.11             |
| paas            | 2.0.12             |
| rate-limit      | 0.2.11             |
| redis           | (see package.json) |
| typeorm         | (see package.json) |

Check individual `packages/<name>/package.json` for authoritative versions. The `feat/update` branch contains version bumps across all packages.

---

## 11. Repository structure

```
/
├── packages/
│   ├── archetype/      — app info endpoint (@Global, bare @Module)
│   ├── aws-sqs/        — AWS SQS client (standalone)
│   ├── camunda/        — Camunda BPMN worker (standalone)
│   ├── auth/           — JWT auth (AuthModule.register/registerAsync, TokenService, JwtAuthGuard)
│   ├── commons/        — app tooling: vitestConfig(), oxlint preset
│   ├── config/         — shared tsconfig.json + Vitest base config (devDep only)
│   ├── core/           — Typings.AppConfig, decorators, guards (RolesGuard, CsrfGuard), Zod env schemas
│   ├── database/       — MongoDB via @nestjs/mongoose (MongoModule)
│   ├── dynamoose/      — DynamoDB via Dynamoose (standalone)
│   ├── elk/            — Elasticsearch client + logging interceptor
│   ├── filters/        — ExceptionsFilter (HTTP exception formatting)
│   ├── health/         — /liveness and /readiness endpoints
│   ├── http-client/    — Axios + axios-retry HttpClientService
│   ├── kafka/          — Kafka producer/consumer, @SubscribeTo, Avro serializers
│   ├── logger/         — pino LoggingService + LoggingInterceptor (structured logs)
│   ├── mailer/         — NodeMailer wrapper (standalone)
│   ├── paas/           — umbrella re-export of cross-cutting packages
│   ├── qrcode/         — QR code generation (standalone)
│   ├── rate-limit/     — @nestjs/throttler wrapper
│   ├── redis/          — Redis client + RedisService
│   ├── response-parser/— ResponseInterceptor (response envelope)
│   ├── snowflake-uid/  — Snowflake ID generator (standalone)
│   ├── test-utils/     — fixtures, config, testcontainers, createMock
│   ├── tracing/        — OpenTelemetry tracing (TracingService, TracingInterceptor)
│   ├── tresdoce-types/ — global TypeScript type augmentations
│   ├── typeorm/        — TypeORM wrapper (TypeOrmClientModule)
│   └── utils/          — RedactModule, FormatModule, BcryptModule
├── dist/               — build output (gitignored)
├── scripts/            — build-dist-package.mjs (published package.json)
├── plopfile.js         — package scaffolding templates (ESM)
├── turbo.json          — Turbo pipeline config
├── lerna.json          — Lerna versioning/publishing config
└── package.json        — root workspaces, scripts, shared devDependencies
```
