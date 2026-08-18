import { z } from 'zod';
import { EAppStage, ESkipHealthChecks } from '../typings/index';

/**
 * Zod counterpart of `validateSchema`. Parses `input` against `schema` and
 * throws a single `Error` with a readable message on failure, mirroring the
 * Joi version's `throw Error(result.error.message)` contract so callers can
 * swap one for the other without changing their error handling.
 */
export const validateSchemaZod = <T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `"${issue.path.join('.')}" ${issue.message}`)
      .join('; ');
    throw new Error(message);
  }
  return result.data;
};

const skipHealthChecksZod = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (value === undefined) return true;
      const skipHealthChecks = value.split(',').map((item) => item.trim().toLowerCase());
      return skipHealthChecks.every((item) =>
        Object.values(ESkipHealthChecks as unknown as Record<string, string>).includes(item),
      );
    },
    { message: 'SKIP_HEALTH_CHECKS.invalid' },
  );

/**
 * Zod equivalent of `baseValidationSchema` — a plain `z.ZodRawShape` (not yet
 * wrapped in `z.object()`), field-for-field matching the Joi version.
 *
 * Note: the Joi version's `PROPAGATE_HEADERS` default is `[]` even though the
 * field is a comma-separated string everywhere else in this schema (an
 * inconsistency in the original) — this Zod version intentionally does not
 * "fix" that and instead defaults to `''`, the type-correct empty value.
 */
export const baseValidationSchemaZod = {
  NODE_ENV: z.string(),
  APP_STAGE: z.nativeEnum(EAppStage),
  PORT: z.coerce.number(),
  API_PREFIX: z.string(),
  CONTEXT: z.string(),
  ORIGINS: z.string(),
  EXPOSED_HEADERS: z.string().optional(),
  ALLOWED_HEADERS: z.string(),
  ALLOWED_METHODS: z.string(),
  PROPAGATE_HEADERS: z.string().optional().default(''),
  CORS_ENABLED: z.coerce.boolean(),
  CORS_CREDENTIALS: z.coerce.boolean(),
  SWAGGER_PATH: z.string(),
  SWAGGER_ENABLED: z.coerce.boolean(),
  SKIP_HEALTH_CHECKS: skipHealthChecksZod,
  HEALTH_CHECK_STORAGE_PATH: z.string().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD: z.coerce.number().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD_PERCENT: z.coerce.number().optional(),
  HEALTH_CHECK_MEMORY_HEAP: z.coerce.number().optional(),
  HEALTH_CHECK_MEMORY_RSS: z.coerce.number().optional(),
};

/**
 * Zod equivalent of `validationSchemaCsrf`. Unlike Joi's `.when()`, Zod has
 * no single-field conditional-on-sibling validator, so this is kept as a raw
 * shape entry (`CSRF_SECRET` optional string) for spread-composability with
 * `baseValidationSchemaZod` — the actual prod-required + regex + message
 * logic is applied via `.superRefine()` once the shapes are merged into an
 * object schema, see `applyCsrfRefinement` below and its use in
 * `validateSchemaForAppZod`.
 */
export const validationSchemaCsrfZod = {
  CSRF_SECRET: z.string().optional(),
};

const CSRF_SECRET_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{32}$/;

/**
 * Applies the CSRF_SECRET conditional-on-APP_STAGE rule to an object schema
 * that already includes both `APP_STAGE` and `CSRF_SECRET` in its shape.
 * Only relevant when a schema was built with `validationSchemaCsrfZod`
 * spread into it — safe to call unconditionally otherwise since it no-ops
 * when `CSRF_SECRET` is absent from the parsed data and `APP_STAGE` isn't 'prod'.
 */
const applyCsrfRefinement = <T extends z.ZodObject<z.ZodRawShape>>(schema: T) =>
  schema.superRefine((data, ctx) => {
    if (data.APP_STAGE !== EAppStage.prod) return;

    const secret = (data as Record<string, unknown>).CSRF_SECRET;

    if (secret === undefined || secret === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CSRF_SECRET'],
        message:
          '"CSRF_SECRET" is required. Request a valid "CSRF_SECRET" from the IT security team.',
      });
      return;
    }

    if (typeof secret !== 'string' || !CSRF_SECRET_REGEX.test(secret)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CSRF_SECRET'],
        message: '"CSRF_SECRET" is invalid.',
      });
    }
  });

/**
 * Zod equivalent of `baseValidationSchemaApp`.
 */
export const baseValidationSchemaAppZod = {
  ...baseValidationSchemaZod,
  TRACING_ENDPOINT: z.string().optional(),
  TRACING_AUTH_TOKEN: z.string().optional(),
  TRACING_IGNORE_PATHS: z.string().optional(),
};

/**
 * Zod equivalent of `validateSchemaForApp`.
 *
 * Unlike the Joi version — which returns a bare `Joi.ObjectSchema` because
 * `@nestjs/config`'s `validationSchema` option knows how to call `.validate()`
 * on a Joi schema directly — this returns a ready-to-use `validate` function,
 * because `@nestjs/config` has no Zod-specific option: Zod schemas plug in
 * via the generic `validate` option instead, which expects a plain
 * `(config: Record<string, unknown>) => Record<string, unknown>` function.
 *
 * Usage:
 * ```ts
 * // Joi (existing):
 * ConfigModule.forRoot({ validationSchema: validateSchemaForApp({ MY_VAR: Joi.string().required() }) })
 *
 * // Zod (this):
 * ConfigModule.forRoot({ validate: validateSchemaForAppZod({ MY_VAR: z.string() }) })
 * ```
 *
 * If the merged shape includes `CSRF_SECRET` (i.e. the caller spread
 * `validationSchemaCsrfZod` into `extraShape`), the prod-required CSRF rule
 * is applied automatically.
 */
export const validateSchemaForAppZod = (extraShape: z.ZodRawShape = {}) => {
  const mergedShape = { ...baseValidationSchemaAppZod, ...extraShape };
  const objectSchema = z.object(mergedShape);
  const schema = 'CSRF_SECRET' in mergedShape ? applyCsrfRefinement(objectSchema) : objectSchema;

  return (config: Record<string, unknown>): Record<string, unknown> =>
    validateSchemaZod(schema, config);
};
