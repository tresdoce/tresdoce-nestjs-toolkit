import Joi from 'joi';
import { EAppStage } from '../typings';

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
  PROPAGATE_HEADERS: Joi.string().optional(),
  CORS_ENABLED: Joi.boolean().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),
  SWAGGER_PATH: Joi.string().required(),
  SWAGGER_ENABLED: Joi.boolean().required(),
  SKIP_HEALTH_CHECKS: Joi.string().optional(),
  HEALTH_CHECK_STORAGE_PATH: Joi.string().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD: Joi.number().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD_PERCENT: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_HEAP: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_RSS: Joi.number().optional(),
};

export const baseValidationSchemaApp = {
  ...baseValidationSchema,
  TRACING_ENDPOINT: Joi.string().optional(),
  TRACING_AUTH_TOKEN: Joi.string().optional(),
};

export const validateSchemaForApp = (_validationSchema: object) => {
  return Joi.object({
    ...baseValidationSchemaApp,
    ..._validationSchema,
  });
};
