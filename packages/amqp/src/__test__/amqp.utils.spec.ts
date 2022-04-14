import { AMQPModuleOptions } from '../lib/interfaces/amqp.interfaces';
import {
  getConnectionToken,
  getConsumerToken,
  getID,
  getProducerToken,
  getToken,
  parseURL,
} from '../lib/utils/amqp.utils';

describe('getConnectionToken', () => {
  it('should return `default:connection`', () => {
    const result = getConnectionToken();
    expect(result).toBe('default:connection');
  });

  it('should return `default:connection` when input is empty string', () => {
    const result = getConnectionToken('');
    expect(result).toBe('default:connection');
  });

  it('should return `test:connection` when input is `test`', () => {
    const result = getConnectionToken('test');
    expect(result).toBe('test:connection');
  });

  it('should return `default:connection` when input is empty option', () => {
    const option: AMQPModuleOptions = {};
    const result = getConnectionToken(option);
    expect(result).toBe('default:connection');
  });

  it('should return `demo:connection` when option name is `demo`', () => {
    const option: AMQPModuleOptions = { name: 'demo' };
    const result = getConnectionToken(option);
    expect(result).toBe('demo:connection');
  });
});

describe('getConsumerToken', () => {
  it('should return token string', () => {
    const result = getConsumerToken('demo');
    expect(result).toBe('demo:consumer:default:connection');
  });
});

describe('getID', () => {
  it('should return generated id', () => {
    const result = getID();
    expect(result).toHaveLength(19);
  });
});

describe('getProducerToken', () => {
  it('should return token string', () => {
    const result = getProducerToken('demo');
    expect(result).toBe('demo:producer:default:connection');
  });
});

describe('getToken', () => {
  it('should return `undefined`', () => {
    const result = getToken(undefined);
    expect(result).toBe('undefined');
  });

  it('should return token string', () => {
    const result = getToken(' Demo token 1');
    expect(result).toBe('demo-token-1');
  });
});

describe('parseURL', () => {
  it('should throw error when input is http protocol', () => {
    const result = expect(() => parseURL('http://localhost:8080'));
    result.toThrow('Not supported connection protocol: http:');
  });

  it('should work with amqp:// protocol', () => {
    const result = parseURL('amqp://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'tcp' }));
  });

  it('should work with amqps:// protocol', () => {
    const result = parseURL('amqps://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'ssl' }));
  });

  it('should work with amqp+ssl:// protocol', () => {
    const result = parseURL('amqp+ssl://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'ssl' }));
  });

  it('should work with amqp+tls:// protocol', () => {
    const result = parseURL('amqp+tls://localhost:5672');
    expect(result).toEqual(expect.objectContaining({ transport: 'tls' }));
  });
});
