import type { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

/** Valores admitidos como parámetros extra del query string de la URI. */
export type MongoUriParam = string | number | boolean;

/** Opciones de conexión que lee `MongoModule` desde `config.database.mongo`. */
export interface MongoModuleOptions {
  /**
   * URI completa de conexión. Si se define, tiene prioridad y se usa tal cual
   * (el resto de las propiedades de la URI se ignoran).
   */
  uri?: string;
  /** Protocolo: `mongodb` (default) o `mongodb+srv`. */
  connection?: string;
  /** Host (o lista `host1:27017,host2:27017`). Requerido si no se define `uri`. */
  host?: string;
  /** Puerto. Se omite en `mongodb+srv`. */
  port?: number;
  /** Usuario. Se codifica automáticamente (no hace falta `encodeURIComponent`). */
  username?: string;
  /** Contraseña. Solo se usa si hay `username`. Se codifica automáticamente. */
  password?: string;
  /** Base de datos por defecto. */
  database?: string;
  /** Base de datos asociada a las credenciales (ej: `admin`). */
  authSource?: string;
  /** Parámetros extra del query string (ej: `{ replicaSet: 'rs0', retryWrites: true }`). */
  params?: Record<string, MongoUriParam>;
  /** Opciones extra de Mongoose / `@nestjs/mongoose` (timeouts, retryAttempts, etc.). */
  connectionOptions?: Omit<MongooseModuleFactoryOptions, 'uri'>;
}
