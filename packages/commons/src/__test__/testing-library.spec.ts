import {
  defaultCoverageValue,
  ignoreDecoratorMetadataCoverage,
  maxCoverageValue,
  minCoverageValue,
  vitestConfig,
} from '../index.js';

const thresholdsOf = (config: ReturnType<typeof vitestConfig>) =>
  config.test?.coverage?.['thresholds'];

describe('testing-library', () => {
  it('should return the default vitest config', () => {
    const config = vitestConfig();
    expect(config.test?.globals).toBe(true);
    expect(config.test?.environment).toBe('node');
    expect(config.test?.setupFiles).toEqual([]);
    expect(thresholdsOf(config)).toEqual({
      branches: defaultCoverageValue,
      functions: defaultCoverageValue,
      lines: defaultCoverageValue,
      statements: defaultCoverageValue,
    });
  });

  it('should use the given coverage value', () => {
    const config = vitestConfig({ minCoveragePercent: 85, setupFiles: ['./vitest.setup.ts'] });
    expect(thresholdsOf(config)).toHaveProperty('lines', 85);
    expect(config.test?.setupFiles).toEqual(['./vitest.setup.ts']);
  });

  it(`should clamp coverage values below ${minCoverageValue}`, () => {
    expect(thresholdsOf(vitestConfig({ minCoveragePercent: -10 }))).toHaveProperty(
      'branches',
      minCoverageValue,
    );
  });

  it(`should clamp coverage values above ${maxCoverageValue}`, () => {
    expect(thresholdsOf(vitestConfig({ minCoveragePercent: 150 }))).toHaveProperty(
      'statements',
      maxCoverageValue,
    );
  });

  it('should include the decorator coverage plugin by default', () => {
    expect(vitestConfig().plugins).toEqual([
      expect.objectContaining({ name: 'tresdoce:ignore-decorator-metadata-coverage' }),
    ]);
    expect(vitestConfig({ ignoreDecoratorMetadata: false }).plugins).toEqual([]);
  });

  it('should exclude test helpers from coverage', () => {
    expect(vitestConfig().test?.coverage?.exclude).toContain('src/**/__test__/**');
  });
});

describe('ignoreDecoratorMetadataCoverage', () => {
  const transform = (code: string, id: string) =>
    (ignoreDecoratorMetadataCoverage().transform as (code: string, id: string) => any)(code, id);

  it('should skip non TS files and code without decorators', () => {
    expect(transform('_decorate([Injectable()], Foo);', 'foo.js')).toBeNull();
    expect(transform('export const a = 1;', 'foo.ts')).toBeNull();
  });

  it('should prefix each statement that calls _decorate', () => {
    const code = [
      'let Foo = class Foo {};',
      'Foo = _decorate([Injectable(), _decorateMetadata("design:paramtypes", [])], Foo);',
      '_decorate([Get()], Foo.prototype, "get", null); _decorate([Post()], Foo.prototype, "post", null);',
      'my_decorate(Foo);',
      ' * see _decorate([...]) in a comment',
      '  let Bar = _decorate([Module({})], Bar);',
    ].join('\n');
    const result = transform(code, 'foo.service.ts?v=1');
    const lines = result.code.split('\n');
    expect(lines[0]).toBe('let Foo = class Foo {};');
    expect(lines[1]).toMatch(/^\/\* istanbul ignore next \*\/ Foo = _decorate\(/);
    expect(lines[2].match(/istanbul ignore next/g)).toHaveLength(1);
    expect(lines[3]).toBe('my_decorate(Foo);');
    expect(lines[4]).toBe(' * see _decorate([...]) in a comment');
    expect(lines[5]).toBe('/* istanbul ignore next */   let Bar = _decorate([Module({})], Bar);');
    expect(result.map.sources).toEqual(['foo.service.ts?v=1']);
  });
});
