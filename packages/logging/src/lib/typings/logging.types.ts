export type LoggingModuleLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
export type LogType = 'DEFAULT' | 'REQUEST' | 'RESPONSE' | 'OUTGOING_REQUEST' | 'OUTGOING_RESPONSE';
export type ElasticSearchConfig = {
  index: string;
  node: string;
  auth?: {
    username: string;
    password: string;
  };
  cloud?: {
    id: string;
  };
  'es-version'?: number;
  'flush-bytes'?: number;
  'flush-interval'?: number;
  maxRetries?: number;
  requestTimeout?: number;
  pingTimeout?: number;
  resurrectStrategy?: 'ping' | 'optimistic' | 'none';
  compression?: 'gzip';
  Connection?: any;
};
