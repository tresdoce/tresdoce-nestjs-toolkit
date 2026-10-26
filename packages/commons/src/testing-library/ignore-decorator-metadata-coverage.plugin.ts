import MagicString from 'magic-string';
import type { Plugin } from 'vitest/config';

/**
 * Matches statements that call the `_decorate` helper emitted by oxc, either bare (member
 * decorators) or assigned to the class binding (`Foo = _decorate`, class decorators).
 * Anchored to the start of the line so mentions inside comments or strings are ignored.
 */
const decorateStatement =
  /^[ \t]*(?:(?:let|const|var)[ \t]+)?(?:[\w$.]+[ \t]*=[ \t]*)*_decorate\(/gm;

/**
 * Vite's TS transform (oxc) wraps decorated classes and members in `_decorate` calls whose
 * `design:paramtypes` metadata (`typeof X === "undefined" ? Object : X` ternaries)
 * are counted as uncovered branches on every decorated class. This plugin prefixes those
 * statements with an istanbul hint so only hand-written code is measured.
 */
export const ignoreDecoratorMetadataCoverage = (): Plugin => ({
  name: 'tresdoce:ignore-decorator-metadata-coverage',
  // No `enforce`: runs after Vite's own oxc transform and before the coverage instrumenter.
  transform(code: string, id: string) {
    if (!/\.ts($|\?)/.test(id)) return null;
    const matches = [...code.matchAll(decorateStatement)];
    if (matches.length === 0) return null;
    const s = new MagicString(code);
    for (const match of matches) s.prependLeft(match.index, '/* istanbul ignore next */ ');
    return { code: s.toString(), map: s.generateMap({ hires: true, source: id }) };
  },
});
