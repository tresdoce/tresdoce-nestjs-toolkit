import { corePathsExcludes, excludePaths, corePathsExcludesGlobs } from '../index';
import { RequestMethod } from '@nestjs/common';

describe('commons', () => {
  describe('with env context', () => {
    beforeEach(() => {
      process.env.CONTEXT = 'v1/api-test';
    });

    it('should be return commons exclude paths with context', () => {
      expect(corePathsExcludes()).not.toBe(null);
      expect(corePathsExcludes()).toBeDefined();
      expect(corePathsExcludes()).toBeInstanceOf(Array);

      expect(corePathsExcludes()).toContainObject({
        path: `/v1/api-test/health/liveness`,
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: `/v1/api-test/health/readiness`,
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: `/v1/api-test/info`,
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: `/v1/api-test/metrics`,
        method: RequestMethod.GET,
      });
    });

    it('should be return array of exclude paths with context', () => {
      expect(excludePaths()).not.toBe(null);
      expect(excludePaths()).toBeDefined();
      expect(excludePaths()).toBeInstanceOf(Array);
      expect(excludePaths()).toEqual([
        `/v1/api-test/health/liveness`,
        `/v1/api-test/health/readiness`,
        `/v1/api-test/info`,
        `/v1/api-test/metrics`,
      ]);
    });

    it('should be return array of exclude paths with globs', () => {
      expect(corePathsExcludesGlobs).not.toBe(null);
      expect(corePathsExcludesGlobs).toBeDefined();
      expect(corePathsExcludesGlobs).toBeInstanceOf(Array);
      expect(corePathsExcludesGlobs).toEqual([
        '**/health/liveness',
        '**/health/readiness',
        '**/info',
        '**/metrics',
      ]);
    });
  });

  describe('without env context', () => {
    beforeEach(() => {
      process.env.CONTEXT = '';
    });

    it('should be return commons exclude paths without context', () => {
      expect(corePathsExcludes()).not.toBe(null);
      expect(corePathsExcludes()).toBeDefined();
      expect(corePathsExcludes()).toBeInstanceOf(Array);

      expect(corePathsExcludes()).toContainObject({
        path: '/health/liveness',
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: '/health/readiness',
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: '/info',
        method: RequestMethod.GET,
      });

      expect(corePathsExcludes()).toContainObject({
        path: '/metrics',
        method: RequestMethod.GET,
      });
    });

    it('should be return array of exclude paths without context', () => {
      expect(excludePaths()).not.toBe(null);
      expect(excludePaths()).toBeDefined();
      expect(excludePaths()).toBeInstanceOf(Array);
      expect(excludePaths()).toEqual([
        '/health/liveness',
        '/health/readiness',
        '/info',
        '/metrics',
      ]);
    });
  });
});
