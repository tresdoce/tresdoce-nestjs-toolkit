import { z } from 'zod';
import {
  validateSchema,
  baseValidationSchemaApp,
  validateSchemaForApp,
  validationSchemaCsrf,
  zBooleanFromEnv,
} from '../validations/index.js';

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

const VALID_CSRF_SECRET = '9r@F5z!X8w*L3q&H2s^J7p#K1n$Y4m?A';

describe('appConfigValidationSchema (Zod)', () => {
  describe('validateSchema', () => {
    it('should validate the base schema correctly', () => {
      const schema = z.object({ ...baseValidationSchemaApp });
      expect(validateSchema(schema, baseInput)).toEqual(baseInput);
    });

    it('should throw an error for invalid APP_STAGE value', () => {
      const schema = z.object({ ...baseValidationSchemaApp });
      expect(() => validateSchema(schema, { ...baseInput, APP_STAGE: 'sarasa' })).toThrow(
        /APP_STAGE/,
      );
    });

    it('should throw an error for invalid SKIP_HEALTH_CHECKS value', () => {
      const schema = z.object({ ...baseValidationSchemaApp });
      expect(() => validateSchema(schema, { ...baseInput, SKIP_HEALTH_CHECKS: 'sarasa' })).toThrow(
        /SKIP_HEALTH_CHECKS/,
      );
    });

    it('should allow SKIP_HEALTH_CHECKS to be omitted entirely', () => {
      const schema = z.object({ ...baseValidationSchemaApp });
      const { SKIP_HEALTH_CHECKS: _omitted, ...input } = baseInput;
      expect(validateSchema(schema, input).SKIP_HEALTH_CHECKS).toBeUndefined();
    });

    it('should validate the base schema extended with a new field', () => {
      const schema = z.object({ ...baseValidationSchemaApp, field: z.string() });
      const input = { ...baseInput, field: 'test' };
      expect(validateSchema(schema, input)).toEqual(input);
    });

    it('should report root-level issues without a field path', () => {
      expect(() => validateSchema(z.string(), 123)).toThrow(/^Invalid input/);
    });

    it('should report every invalid field in a single error', () => {
      const schema = z.object({ ...baseValidationSchemaApp, field: z.string() });
      expect(() => validateSchema(schema, { ...baseInput, field: 123, PORT: 'abc' })).toThrow(
        /"PORT".*"field"|"field".*"PORT"/,
      );
    });
  });

  describe('zBooleanFromEnv', () => {
    it.each([
      ['true', true],
      ['TRUE', true],
      [' false ', false],
      ['false', false],
      [true, true],
      [false, false],
    ])('should parse %j as %j', (input, expected) => {
      expect(zBooleanFromEnv().parse(input)).toBe(expected);
    });

    it('should reject values that are not booleans', () => {
      expect(() => zBooleanFromEnv().parse('yes')).toThrow();
    });
  });

  describe('validateSchemaForApp', () => {
    it('should return a Standard Schema that @nestjs/config can consume', async () => {
      const schema = validateSchemaForApp();
      const result = await schema['~standard'].validate(baseInput);
      expect(result.issues).toBeUndefined();
      expect('value' in result && result.value).toEqual(baseInput);
    });

    it('should validate the base schema plus extra fields', () => {
      const schema = validateSchemaForApp({
        TEST_KEY: z.string(),
        RICK_AND_MORTY_API_URL: z.string(),
      });
      const input = {
        ...baseInput,
        TEST_KEY: 'testKeyEnv-example',
        RICK_AND_MORTY_API_URL: 'https://rickandmortyapi.com/api',
      };
      expect(schema.parse(input)).toEqual(input);
    });

    it('should fail for invalid extra fields', () => {
      const schema = validateSchemaForApp({ TEST_KEY: z.string() });
      expect(schema.safeParse({ ...baseInput, TEST_KEY: 123 }).success).toBe(false);
    });

    it('should coerce env strings to numbers and booleans', () => {
      const result = validateSchemaForApp().parse({
        ...baseInput,
        PORT: '8081',
        CORS_ENABLED: 'false',
        SWAGGER_ENABLED: 'true',
      });
      expect(result.PORT).toBe(8081);
      expect(result.CORS_ENABLED).toBe(false);
      expect(result.SWAGGER_ENABLED).toBe(true);
    });

    it('should accept a valid CSRF_SECRET in prod stage', () => {
      const schema = validateSchemaForApp({ ...validationSchemaCsrf });
      const input = { ...baseInput, APP_STAGE: 'prod', CSRF_SECRET: VALID_CSRF_SECRET };
      expect(schema.parse(input)).toEqual(input);
    });

    it('should reject an invalid CSRF_SECRET in prod stage', () => {
      const schema = validateSchemaForApp({ ...validationSchemaCsrf });
      const result = schema.safeParse({ ...baseInput, APP_STAGE: 'prod', CSRF_SECRET: 'invalid' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('"CSRF_SECRET" is invalid.');
    });

    it('should require CSRF_SECRET in prod stage', () => {
      const schema = validateSchemaForApp({ ...validationSchemaCsrf });
      const result = schema.safeParse({ ...baseInput, APP_STAGE: 'prod' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toMatch(/is required/);
    });

    it('should allow a missing CSRF_SECRET outside prod', () => {
      const schema = validateSchemaForApp({ ...validationSchemaCsrf });
      expect(schema.safeParse(baseInput).success).toBe(true);
    });
  });
});
