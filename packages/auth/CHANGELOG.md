# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0](https://github.com/tresdoce/tresdoce-nestjs-toolkit/compare/%40tresdoce-nestjs-toolkit%2Fauth%400.2.0...%40tresdoce-nestjs-toolkit%2Fauth%401.0.0) (2026-10-26)

### ⚠ BREAKING CHANGES

- packages are ESM-only and require NestJS 12 and
  Node.js >= 22.22. validateSchemaForApp now returns a Zod schema (Joi helpers
  are available with a Joi suffix). Jest helpers were replaced by Vitest ones
  (JestFN kept as a deprecated alias of VitestFN). commons no longer exports
  eslintConfig, jestConfig or the webpack build config. tracing no longer
  propagates uber-trace-id. bcrypt hashes are no longer deterministic.

- **version:** version packages as pre-release ([d91b3c2](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/d91b3c24a9dce790efc34f7bfa673370c94a92d9))

### ✨ Features

- migrate toolkit to ESM and NestJS 12 ([4f6d7c6](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/4f6d7c62f2209aeb56f48b9acda04712840d4323))

## 0.2.0 (2026-08-18)

- **version:** version packages as pre-release ([502b36b](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/502b36b94a5ad53fc032803a0281dd677bc2d2e0))

### ✨ Features

- **auth:** add JWT auth module ([a1dc382](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/a1dc382431268731a39c421244f120f0b8b17a5b))
