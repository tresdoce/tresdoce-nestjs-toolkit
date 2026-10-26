/**
 * Extrae un mensaje legible de un error `unknown` (lo que llega a un `catch`).
 * @param error Valor capturado.
 * @returns El `message` si es un `Error`, el string tal cual, o el valor serializado.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error) ?? `${error as undefined}`;
};
