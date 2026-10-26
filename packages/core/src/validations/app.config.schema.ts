import { z } from 'zod';
import { EAppStage, ESkipHealthChecks } from '../typings/index.js';

const CSRF_SECRET_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{32}$/;

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((issue) =>
      issue.path.length ? `"${issue.path.join('.')}": ${issue.message}` : issue.message,
    )
    .join('. ');

/**
 * Valida `input` contra `schema` y devuelve el valor parseado.
 * Ante un error lanza un único `Error` con todos los problemas encontrados.
 */
export const validateSchema = <T extends z.ZodType>(schema: T, input: unknown): z.output<T> => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  return result.data;
};

/**
 * Número leído de una variable de entorno: acepta `8080` o `'8080'`.
 */
export const zNumberFromEnv = () => z.coerce.number();

/**
 * Booleano leído de una variable de entorno: acepta `true`/`false` o los strings
 * `'true'`/`'false'` (sin distinguir mayúsculas). A diferencia de `z.coerce.boolean()`,
 * el string `'false'` se interpreta como `false`.
 */
export const zBooleanFromEnv = () =>
  z.preprocess((value) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return value;
  }, z.boolean());

const skipHealthChecksSchema = z
  .string()
  .refine(
    (value) =>
      value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .every((item) => (Object.values(ESkipHealthChecks) as string[]).includes(item)),
    {
      message: `"SKIP_HEALTH_CHECKS" must be a comma-separated list of [${Object.values(ESkipHealthChecks).join(', ')}]`,
    },
  )
  .optional();

/**
 * Variables de entorno base que toda app del starter debe definir.
 * Es un `z.ZodRawShape`, así se puede combinar con otros shapes usando spread.
 */
export const baseValidationSchema = {
  NODE_ENV: z.string(),
  APP_STAGE: z.enum(EAppStage),
  PORT: zNumberFromEnv(),
  API_PREFIX: z.string(),
  CONTEXT: z.string(),
  ORIGINS: z.string(),
  EXPOSED_HEADERS: z.string().optional(),
  ALLOWED_HEADERS: z.string(),
  ALLOWED_METHODS: z.string(),
  PROPAGATE_HEADERS: z.string().optional(),
  CORS_ENABLED: zBooleanFromEnv(),
  CORS_CREDENTIALS: zBooleanFromEnv(),
  SWAGGER_PATH: z.string(),
  SWAGGER_ENABLED: zBooleanFromEnv(),
  SKIP_HEALTH_CHECKS: skipHealthChecksSchema,
  HEALTH_CHECK_STORAGE_PATH: z.string().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD: zNumberFromEnv().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD_PERCENT: zNumberFromEnv().optional(),
  HEALTH_CHECK_MEMORY_HEAP: zNumberFromEnv().optional(),
  HEALTH_CHECK_MEMORY_RSS: zNumberFromEnv().optional(),
} satisfies z.ZodRawShape;

/**
 * Agrega `CSRF_SECRET`. Es opcional fuera de prod; en prod es obligatorio y debe cumplir
 * el formato (32 caracteres con minúscula, mayúscula, número y símbolo). Esa regla depende
 * de `APP_STAGE`, por eso se aplica en `validateSchemaForApp` cuando el shape incluye
 * `CSRF_SECRET`.
 */
export const validationSchemaCsrf = {
  CSRF_SECRET: z.string().optional(),
} satisfies z.ZodRawShape;

export const baseValidationSchemaApp = {
  ...baseValidationSchema,
  TRACING_ENDPOINT: z.string().optional(),
  TRACING_AUTH_TOKEN: z.string().optional(),
  TRACING_IGNORE_PATHS: z.string().optional(),
} satisfies z.ZodRawShape;

const applyCsrfRule = (data: Record<string, unknown>, ctx: z.RefinementCtx): void => {
  if (data.APP_STAGE !== EAppStage.prod) return;

  const secret = data.CSRF_SECRET;
  if (secret === undefined || secret === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['CSRF_SECRET'],
      message:
        '"CSRF_SECRET" is required. Request a valid "CSRF_SECRET" from the IT security team.',
    });
    return;
  }
  if (typeof secret !== 'string' || !CSRF_SECRET_REGEX.test(secret)) {
    ctx.addIssue({ code: 'custom', path: ['CSRF_SECRET'], message: '"CSRF_SECRET" is invalid.' });
  }
};

/**
 * Arma el schema de variables de entorno de la app: el shape base más `extraShape`.
 * Devuelve un schema Zod, que `@nestjs/config` 12 acepta directamente (Standard Schema).
 *
 * @example
 * ```ts
 * ConfigModule.forRoot({
 *   validationSchema: validateSchemaForApp({
 *     ...validationSchemaCsrf,
 *     RICK_AND_MORTY_API_URL: z.url(),
 *   }),
 * });
 * ```
 */
export const validateSchemaForApp = <T extends z.ZodRawShape = Record<never, never>>(
  extraShape: T = {} as T,
) => {
  const shape = { ...baseValidationSchemaApp, ...extraShape };
  const objectSchema = z.object(shape);
  return 'CSRF_SECRET' in shape
    ? objectSchema.superRefine((data, ctx) => applyCsrfRule(data, ctx))
    : objectSchema;
};
