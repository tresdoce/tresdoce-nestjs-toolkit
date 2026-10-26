import * as paas from '../index.js';
import * as core from '@tresdoce-nestjs-toolkit/core';
import * as filters from '@tresdoce-nestjs-toolkit/filters';
import * as health from '@tresdoce-nestjs-toolkit/health';
import * as logger from '@tresdoce-nestjs-toolkit/logger';
import * as responseParser from '@tresdoce-nestjs-toolkit/response-parser';
import * as tracing from '@tresdoce-nestjs-toolkit/tracing';
import * as utils from '@tresdoce-nestjs-toolkit/utils';

const reExported: Record<string, Record<string, unknown>> = {
  core,
  filters,
  health,
  logger,
  'response-parser': responseParser,
  tracing,
  utils,
};

describe('paas', () => {
  it('should not have runtime export name collisions between re-exported packages', () => {
    const owners = new Map<string, string[]>();
    for (const [pkg, mod] of Object.entries(reExported)) {
      for (const name of Object.keys(mod)) {
        owners.set(name, [...(owners.get(name) ?? []), pkg]);
      }
    }
    const duplicated = [...owners.entries()]
      .filter(([, pkgs]) => pkgs.length > 1)
      .map(([name, pkgs]) => `${name} (${pkgs.join(', ')})`);

    expect(duplicated).toEqual([]);
  });

  it.each(Object.entries(reExported))(
    'should re-export every runtime symbol of %s',
    (_pkg, mod) => {
      for (const [name, value] of Object.entries(mod)) {
        expect(paas).toHaveProperty(name);
        expect((paas as Record<string, unknown>)[name]).toBe(value);
      }
    },
  );

  it('should expose the main building blocks of a starter app', () => {
    expect(paas.HealthModule).toBeDefined();
    expect(paas.LoggingModule).toBeDefined();
    expect(paas.LoggingService).toBeDefined();
    expect(paas.LoggingInterceptor).toBeDefined();
    expect(paas.ExceptionsFilter).toBeDefined();
    expect(paas.ResponseInterceptor).toBeDefined();
    expect(paas.TracingModule).toBeDefined();
    expect(paas.TracingInterceptor).toBeDefined();
    expect(paas.otelProvider).toBeDefined();
    expect(paas.validateSchemaForApp).toBeDefined();
    expect(paas.RedactModule).toBeDefined();
  });

  it('should not re-export rate-limit', () => {
    expect(paas).not.toHaveProperty('RateLimitModule');
    expect(paas).not.toHaveProperty('ThrottlerGuard');
  });
});
