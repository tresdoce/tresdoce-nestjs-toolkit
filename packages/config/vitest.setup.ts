import 'reflect-metadata';
import { expect } from 'vitest';

expect.extend({
  /** Passes when `received` is an array containing an object that matches `argument`. */
  toContainObject(received: unknown, argument: Record<string, unknown>) {
    const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));
    return {
      pass,
      message: () =>
        `expected ${this.utils.printReceived(received)} ${pass ? 'not ' : ''}to contain object ${this.utils.printExpected(argument)}`,
    };
  },

  /** Passes when `received` is an instance of `classTypeOrNull` or `null`. */
  toBeTypeOrNull(received: unknown, classTypeOrNull: unknown) {
    const pass = received === null || this.equals(received, expect.any(classTypeOrNull));
    return {
      pass,
      message: () => `expected ${String(received)} to be ${String(classTypeOrNull)} type or null`,
    };
  },
});
