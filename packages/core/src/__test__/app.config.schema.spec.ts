import Joi from 'joi';
import {
  validateSchema,
  baseValidationSchemaApp,
  validateSchemaForApp,
  validationSchemaCsrf,
} from '../validations';

const baseInput = {
  NODE_ENV: 'test',
  APP_STAGE: 'test',
  PORT: 8081,
  API_PREFIX: 'API-TEST',
  CONTEXT: 'v1',
  ORIGINS: 'http://localhost:3000,http://localhost:8080',
  EXPOSED_HEADERS:
    'Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma',
  ALLOWED_HEADERS:
    'Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma',
  ALLOWED_METHODS: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  PROPAGATE_HEADERS: 'x-custom-header-test',
  CORS_ENABLED: true,
  CORS_CREDENTIALS: false,
  SWAGGER_PATH: 'docs',
  SWAGGER_ENABLED: false,
  TRACING_ENDPOINT: 'http://docker:4318/v1/traces',
  TRACING_AUTH_TOKEN: 'test-token',
  SKIP_HEALTH_CHECKS: 'storage,memory',
};

describe('appConfigValidationSchema', () => {
  describe('validateSchema for apps', () => {
    it('should validate the base schema correctly', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
      };
      const result = validateSchema(validationSchema, baseInput);
      expect(result).toEqual(baseInput);
    });

    it('should throw an error for invalid APP_STAGE value in base schema', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
      };
      const input = {
        ...baseInput,
        APP_STAGE: 'sarasa',
        field: 123,
      };
      expect(() => validateSchema(validationSchema, input)).toThrow(Error);
    });

    it('should throw an error for invalid SKIP_HEALTH_CHECKS value in base schema', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
      };
      const input = {
        ...baseInput,
        SKIP_HEALTH_CHECKS: 'sarasa',
        field: 123,
      };
      expect(() => validateSchema(validationSchema, input)).toThrow(Error);
    });

    it('should validate the base schema with a new input correctly', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
        field: Joi.string().required(),
      };
      const input = {
        ...baseInput,
        field: 'test',
      };
      const result = validateSchema(validationSchema, input);
      expect(result).toEqual(input);
    });

    it('should throw an error for invalid input in the base schema', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
        field: Joi.string().required(),
      };
      const input = {
        ...baseInput,
        field: 123,
      };
      expect(() => validateSchema(validationSchema, input)).toThrow(Error);
    });

    it('should validate CSRF_SECRET correctly in prod stage', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
        ...validationSchemaCsrf,
      };
      const input = {
        ...baseInput,
        APP_STAGE: 'prod',
        CSRF_SECRET: '9r@F5z!X8w*L3q&H2s^J7p#K1n$Y4m?A',
      };
      const result = validateSchema(validationSchema, input);
      expect(result).toEqual(input);
    });

    it('should throw an error for invalid CSRF_SECRET in prod stage', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
        ...validationSchemaCsrf,
      };
      const input = {
        ...baseInput,
        APP_STAGE: 'prod',
        CSRF_SECRET: 'invalidsecret',
      };
      expect(() => validateSchema(validationSchema, input)).toThrow(Error);
    });

    it('should allow optional CSRF_SECRET in non-prod stages', () => {
      const validationSchema = {
        ...baseValidationSchemaApp,
        ...validationSchemaCsrf,
      };
      const input = {
        ...baseInput,
        CSRF_SECRET: undefined,
      };
      const result = validateSchema(validationSchema, input);
      expect(result).toEqual(input);
    });
  });

  describe('validateSchemaForApp', () => {
    it('should validate the schema for app correctly', () => {
      const validationSchema = {
        TEST_KEY: Joi.string().required(),
        RICK_AND_MORTY_API_URL: Joi.string().required(),
        RICK_AND_MORTY_API_URL_LIVENESS: Joi.string().required(),
      };
      const result = validateSchemaForApp(validationSchema);
      expect(result).toBeDefined();
      expect(result).toEqual(expect.any(Object));
    });
  });
});
