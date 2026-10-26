import type { MongoModuleOptions } from '../interfaces/mongo.interface.js';

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Codifica un componente de la URI. Primero decodifica para que los valores que
 * ya vengan codificados con `encodeURIComponent` no queden doblemente codificados.
 */
export const encodeUriComponent = (value: string | number): string =>
  encodeURIComponent(safeDecode(String(value)));

/** Construye la URI de conexión a MongoDB a partir de `MongoModuleOptions`. */
export const buildMongoUri = (options: MongoModuleOptions): string => {
  const {
    uri,
    connection = 'mongodb',
    host,
    port,
    username,
    password,
    database,
    authSource,
    params = {},
  } = options;

  if (uri) return uri;
  if (!host) {
    throw new Error('[MongoModule] `host` or `uri` is required in config.database.mongo');
  }

  const credentials = username
    ? `${encodeUriComponent(username)}${password ? `:${encodeUriComponent(password)}` : ''}@`
    : '';
  const portSegment = port && connection !== 'mongodb+srv' ? `:${port}` : '';
  const query = new URLSearchParams();
  if (authSource) query.set('authSource', safeDecode(authSource));
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const queryString = query.toString();
  const databaseSegment =
    database || queryString ? `/${database ? encodeUriComponent(database) : ''}` : '';

  return `${connection}://${credentials}${host}${portSegment}${databaseSegment}${
    queryString ? `?${queryString}` : ''
  }`;
};
