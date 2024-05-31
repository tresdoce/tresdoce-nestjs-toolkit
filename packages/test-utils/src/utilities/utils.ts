import path from 'path';

export const delay = async (timeout: number = 10000): Promise<any> =>
  await new Promise((r) => setTimeout(r, timeout));

export const pathJoin = (dirName: string, fileName: string) => path.join(dirName, fileName);
