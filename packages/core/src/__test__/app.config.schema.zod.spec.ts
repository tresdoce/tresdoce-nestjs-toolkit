import { z } from 'zod';
import {
  validateSchemaZod,
  baseValidationSchemaAppZod,
  validateSchemaForAppZod,
  validationSchemaCsrfZod,
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

describe('appConfigValidationSchemaZod', () => {
  describe('validateSchemaZod for apps', () => {
    it('should validate the base schema correctly', () => {
      const schema = z.object({ ...baseValidationSchemaAppZod });
      const result = validateSchemaZod(schema, baseInput);
      expect(result).toEqual(baseInput);
    });

    it('should throw an error for invalid APP_STAGE value in base schema', () => {
      const schema = z.object({ ...baseValidationSchemaAppZod });
      const input = {
        ...baseInput,
        APP_STAGE: 'sarasa',
      };
      expect(() => validateSchemaZod(schema, input)).toThrow(Error);
    });

    it('should throw an error for invalid SKIP_HEALTH_CHECKS value in base schema', () => {
      const schema = z.object({ ...baseValidationSchemaAppZod });
      const input = {
        ...baseInput,
        SKIP_HEALTH_CHECKS: 'sarasa',
      };
      expect(() => validateSchemaZod(schema, input)).toThrow(Error);
    });

    it('should allow SKIP_HEALTH_CHECKS to be omitted entirely', () => {
      const schema = z.object({ ...baseValidationSchemaAppZod });
      const { SKIP_HEALTH_CHECKS, ...input } = baseInput;
      const result = validateSchemaZod(schema, input);
      expect(result.SKIP_HEALTH_CHECKS).toBeUndefined();
    });

    it('should validate the base schema with a new input correctly', () => {
      const schema = z.object({
        ...baseValidationSchemaAppZod,
        field: z.string(),
      });
      const input = {
        ...baseInput,
        field: 'test',
      };
      const result = validateSchemaZod(schema, input);
      expect(result).toEqual(input);
    });

    it('should throw an error for invalid input in the base schema', () => {
      const schema = z.object({
        ...baseValidationSchemaAppZod,
        field: z.string(),
      });
      const input = {
        ...baseInput,
        field: 123,
      };
      expect(() => validateSchemaZod(schema, input)).toThrow(Error);
    });

    it('should validate CSRF_SECRET correctly in prod stage', () => {
      const validateFn = validateSchemaForAppZod({ ...validationSchemaCsrfZod });
      const input = {
        ...baseInput,
        APP_STAGE: 'prod',
        CSRF_SECRET: '9r@F5z!X8w*L3q&H2s^J7p#K1n$Y4m?A',
      };
      const result = validateFn(input);
      expect(result).toEqual(input);
    });

    it('should throw an error for invalid CSRF_SECRET in prod stage', () => {
      const validateFn = validateSchemaForAppZod({ ...validationSchemaCsrfZod });
      const input = {
        ...baseInput,
        APP_STAGE: 'prod',
        CSRF_SECRET: 'invalidsecret',
      };
      expect(() => validateFn(input)).toThrow(Error);
    });

    it('should throw an error when CSRF_SECRET is missing in prod stage', () => {
      const validateFn = validateSchemaForAppZod({ ...validationSchemaCsrfZod });
      const input = {
        ...baseInput,
        APP_STAGE: 'prod',
      };
      expect(() => validateFn(input)).toThrow(Error);
    });

    it('should allow optional CSRF_SECRET in non-prod stages', () => {
      const validateFn = validateSchemaForAppZod({ ...validationSchemaCsrfZod });
      const input = {
        ...baseInput,
        CSRF_SECRET: undefined,
      };
      const result = validateFn(input);
      expect(result).toEqual({ ...input, CSRF_SECRET: undefined });
    });
  });

  describe('validateSchemaForAppZod', () => {
    it('should return a callable validate function', () => {
      const validateFn = validateSchemaForAppZod({
        TEST_KEY: z.string(),
        RICK_AND_MORTY_API_URL: z.string(),
        RICK_AND_MORTY_API_URL_LIVENESS: z.string(),
      });
      expect(validateFn).toEqual(expect.any(Function));
    });

    it('should validate correctly through the returned function', () => {
      const validateFn = validateSchemaForAppZod({
        TEST_KEY: z.string(),
        RICK_AND_MORTY_API_URL: z.string(),
        RICK_AND_MORTY_API_URL_LIVENESS: z.string(),
      });
      const input = {
        ...baseInput,
        TEST_KEY: 'testKeyEnv-example',
        RICK_AND_MORTY_API_URL: 'https://rickandmortyapi.com/api',
        RICK_AND_MORTY_API_URL_LIVENESS: '/api/character/1',
      };
      const result = validateFn(input);
      expect(result).toEqual(input);
    });

    it('should throw for invalid input through the returned function', () => {
      const validateFn = validateSchemaForAppZod({
        TEST_KEY: z.string(),
      });
      const input = {
        ...baseInput,
        TEST_KEY: 123,
      };
      expect(() => validateFn(input)).toThrow(Error);
    });

    it('should coerce PORT from a string env value to a number', () => {
      const validateFn = validateSchemaForAppZod();
      const input = { ...baseInput, PORT: '8081' };
      const result = validateFn(input);
      expect(result.PORT).toBe(8081);
    });
  });
});
