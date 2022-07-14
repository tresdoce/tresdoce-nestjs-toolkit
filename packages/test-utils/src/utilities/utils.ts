import path from 'path';

export const delay = async (timeout = 10000) => new Promise((r) => setTimeout(r, timeout));

export const pathJoin = (dirName, fileName) => path.join(dirName, fileName);
