import 'vitest';

/** Custom matchers registered in @tresdoce-nestjs-toolkit/config/vitest.setup.ts. */
interface TresdoceMatchers<R = unknown> {
  toContainObject(argument: Record<string, unknown>): R;
  toBeTypeOrNull(classTypeOrNull: unknown): R;
}

declare module 'vitest' {
  interface Matchers<T = any> extends TresdoceMatchers<T> {}
}
