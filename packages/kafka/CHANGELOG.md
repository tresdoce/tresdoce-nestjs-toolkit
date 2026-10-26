# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.0.0 (2026-10-26)

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

### 🐛 Bug Fixes

- **test-utils:** retry container starts on transient Docker socket errors ([7afc3e7](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/7afc3e7665583ce75f7a7834476f820f07ea4a52))

### ♻️Refactors

- address SonarCloud issues and fix coverage exclusions ([b7c968d](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/b7c968d1035883ab652acbc053e7034f4eae99e8))

### 🧪 Tests

- **kafka:** start Kafka and Schema Registry with testcontainers ([a81a063](https://github.com/tresdoce/tresdoce-nestjs-toolkit/commit/a81a063c450fe321457d6ad5f0f162db44c66af3))
