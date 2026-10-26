import path from 'node:path';

/**
 * Waits `timeout` milliseconds (default: 10000).
 */
export const delay = async (timeout: number = 10000): Promise<void> =>
  await new Promise<void>((resolve) => setTimeout(resolve, timeout));

/**
 * Joins a directory and a file name (wrapper of `path.join`).
 */
export const pathJoin = (dirName: string, fileName: string): string => path.join(dirName, fileName);
