import type { IncomingMessage } from 'node:http';
import { minimatch } from 'minimatch';

import { DEFAULT_IGNORE_PATHS } from '../constants/tracing.constant.js';

/**
 * Combina los paths ignorados por defecto (health, info, metrics, docs) con los
 * definidos por el usuario, sin duplicados.
 */
export const buildIgnorePaths = (ignorePaths: string[] = []): string[] => [
  ...new Set([...DEFAULT_IGNORE_PATHS, ...ignorePaths]),
];

/**
 * Indica si una URL (con o sin query string) coincide con alguno de los globs.
 */
export const isPathIgnored = (url: string | undefined, ignorePaths: string[]): boolean => {
  if (!url) return false;
  const [path] = url.split('?');
  return ignorePaths.some((ignorePath) => minimatch(path, ignorePath));
};

/**
 * Crea el `ignoreIncomingRequestHook` de `HttpInstrumentation` a partir de los globs.
 */
export const createIgnoreIncomingRequestHook =
  (ignorePaths: string[]) =>
  (_request: IncomingMessage): boolean =>
    isPathIgnored(_request.url, ignorePaths);
