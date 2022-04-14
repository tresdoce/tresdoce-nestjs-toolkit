import { AMQPModuleOptions, AMQPTransport, ConnectionURL } from '../interfaces/amqp.interfaces';

/**
 * @param url - url string
 * @returns connection url object
 */
export function parseURL(url: string): ConnectionURL {
  const { protocol, username, password, hostname, port } = new URL(url);
  let transport: AMQPTransport;
  switch (protocol) {
    case 'amqp:':
      transport = 'tcp';
      break;
    case 'amqps:':
      transport = 'ssl';
      break;
    case 'amqp+ssl:':
      transport = 'ssl';
      break;
    case 'amqp+tls:':
      transport = 'tls';
      break;
    default:
      throw new Error(`Not supported connection protocol: ${protocol}`);
  }
  const connectionURL: ConnectionURL = {
    password,
    username,
    transport,
    host: hostname,
    port: Number.parseInt(port, 10),
  };
  return connectionURL;
}
/**
 * @param name - token name
 * @returns token string of name
 */
export function getToken(name: string): string {
  return `${name}`.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * @param source - source name
 * @param connectionName - connection name
 * @returns consumer token
 */
export function getConsumerToken(source: string, connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  const sourceToken = getToken(source);
  return `${sourceToken}:consumer:${connectionToken}`;
}

/**
 * @param target - target name
 * @param connectionName - connection name
 * @returns producer token
 */
export function getProducerToken(target: string, connectionName?: string): string {
  const connectionToken = getConnectionToken(connectionName);
  const targetToken = getToken(target);
  return `${targetToken}:producer:${connectionToken}`;
}

/**
 * @param connection - connection name or module options
 * @returns connection token
 */
export function getConnectionToken(connection?: AMQPModuleOptions | string): string {
  const name = typeof connection === 'string' ? connection : connection?.name;
  const connectionName = name?.trim() || 'default';
  const nameToken = getToken(connectionName);
  return `${nameToken}:connection`;
}

/**
 * @returns generated id
 */
export function getID(): string {
  const start = BigInt(Date.now()) * BigInt(1e6) - process.hrtime.bigint();
  return `${start + process.hrtime.bigint()}`;
}
