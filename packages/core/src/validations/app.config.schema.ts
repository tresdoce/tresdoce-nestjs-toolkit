import Joi from 'joi';
import { EAppStage, ESkipHealthChecks } from '../typings/index';

export const validateSchema = (validationSchema: object, input: any) => {
  const result = Joi.object(validationSchema).validate(input);
  if (result.error) {
    throw Error(result.error.message);
  }
  return result.value;
};

const validateAdditionType = (_appStage: EAppStage, _helpers: any) => {
  if (!Object.values(EAppStage).includes(_appStage)) {
    return _helpers.error('APP_STAGE.invalid');
  }
  return _appStage;
};

const validateSkipHealthChecksType = (_skipHealthChecks: string, _helpers: any) => {
  const skipHealthChecks = _skipHealthChecks.split(',').map((_item) => _item.trim().toLowerCase());
  for (const skipItem of skipHealthChecks) {
    if (!Object.values(ESkipHealthChecks as any).includes(skipItem)) {
      return _helpers.error('SKIP_HEALTH_CHECKS.invalid');
    }
  }
  return _skipHealthChecks;
};

export const baseValidationSchema = {
  NODE_ENV: Joi.string().required(),
  APP_STAGE: Joi.any().required().custom(validateAdditionType, 'APP_STAGE validation'),
  PORT: Joi.number().required(),
  API_PREFIX: Joi.string().required(),
  CONTEXT: Joi.string().required(),
  ORIGINS: Joi.string().required(),
  EXPOSED_HEADERS: Joi.string().optional(),
  ALLOWED_HEADERS: Joi.string().required(),
  ALLOWED_METHODS: Joi.string().required(),
  PROPAGATE_HEADERS: Joi.string().optional().default([]),
  CORS_ENABLED: Joi.boolean().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),
  SWAGGER_PATH: Joi.string().required(),
  SWAGGER_ENABLED: Joi.boolean().required(),
  SKIP_HEALTH_CHECKS: Joi.string()
    .optional()
    .custom(validateSkipHealthChecksType, 'SKIP_HEALTH_CHECKS validation'),
  HEALTH_CHECK_STORAGE_PATH: Joi.string().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD: Joi.number().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD_PERCENT: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_HEAP: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_RSS: Joi.number().optional(),
};

export const validationSchemaCsrf = {
  CSRF_SECRET: Joi.string().when('APP_STAGE', {
    is: 'prod',
    then: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{32}$/)
      .messages({
        'string.empty':
          '"CSRF_SECRET" cannot be empty. Request a valid "CSRF_SECRET" from the IT security team.',
        'string.pattern.base': '"CSRF_SECRET" is invalid.',
        'any.required':
          '"CSRF_SECRET" is required. Request a valid "CSRF_SECRET" from the IT security team.',
      }),
    otherwise: Joi.string().optional(),
  }),
};

export const baseValidationSchemaApp = {
  ...baseValidationSchema,
  TRACING_ENDPOINT: Joi.string().optional(),
  TRACING_AUTH_TOKEN: Joi.string().optional(),
  TRACING_IGNORE_PATHS: Joi.string().optional(),
};

export const validateSchemaForApp = (_validationSchema: object) => {
  return Joi.object({
    ...baseValidationSchemaApp,
    ..._validationSchema,
  });
};
