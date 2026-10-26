import fs from 'node:fs';

/**
 * Lee el certificado y la clave privada para levantar la app con HTTPS
 * (`NestFactory.create(AppModule, { httpsOptions })`).
 * Si alguno de los archivos no existe devuelve `cert` y `key` vacíos.
 *
 * @param certPath - Ruta al certificado (`.crt` / `.pem`).
 * @param keyPath - Ruta a la clave privada (`.key`).
 */
export const setHttpsOptions = (
  certPath: string,
  keyPath: string,
): { cert: Buffer | string; key: Buffer | string } => {
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
  }

  return {
    cert: '',
    key: '',
  };
};
