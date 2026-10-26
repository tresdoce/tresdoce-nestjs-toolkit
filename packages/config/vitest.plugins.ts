import MagicString from 'magic-string';
import type { Plugin } from 'vite';

/**
 * Statements that start with the oxc decorator helper: `_decorate(...)` (property decorators)
 * or `Foo = _decorate(...)` / `let Foo = _decorate(...)` (class decorators). Anchored to the
 * start of a line so mentions inside comments or strings are left alone.
 */
const DECORATE_STATEMENT =
  /^[ \t]*(?:(?:let|const|var)[ \t]+)?(?:[\w$.]+[ \t]*=[ \t]*)*_decorate\(/gm;

/**
 * Vite's TS transform (oxc) emits decorators as
 * `_decorate([Injectable(), _decorateMetadata("design:paramtypes", [typeof X === "undefined" ? Object : X])], Foo)`.
 * The generated ternary is counted as an uncovered branch on every decorated class, so those
 * statements are excluded from coverage and only hand-written code is measured.
 * Vitest already does the same for SWC's `_ts_decorate`.
 */
export const ignoreDecoratorMetadataCoverage = (): Plugin => ({
  name: 'tresdoce:ignore-decorator-metadata-coverage',
  // No `enforce`: runs after Vite's own oxc transform and before the coverage instrumenter.
  transform(code, id) {
    if (!/\.ts($|\?)/.test(id) || !code.includes('_decorate(')) return null;
    const s = new MagicString(code);
    let changed = false;
    for (const match of code.matchAll(DECORATE_STATEMENT)) {
      // Hint the whole statement: a comment placed after `=` would be attached to the
      // assignment target and ignored by istanbul.
      s.prependLeft(match.index, '/* istanbul ignore next */ ');
      changed = true;
    }
    if (!changed) return null;
    return { code: s.toString(), map: s.generateMap({ hires: true, source: id }) };
  },
});
