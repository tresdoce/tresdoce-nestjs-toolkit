import { LoggerProvider } from '../dynamoose/providers/dynamoose-logger.provider.js';

const createLogger = () => ({
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
  fatal: vi.fn(),
});

describe('LoggerProvider', () => {
  it.each([
    ['fatal', 'fatal'],
    ['error', 'error'],
    ['warn', 'warn'],
    ['info', 'log'],
    ['debug', 'debug'],
    ['trace', 'verbose'],
  ] as const)('should map level %s to logger.%s', (level, method) => {
    const logger = createLogger();
    new LoggerProvider(logger).log({ level, category: 'aws:dynamodb', message: 'msg' });
    expect(logger[method]).toHaveBeenCalledWith('aws:dynamodb - msg');
  });

  it('should log only the message when there is no category', () => {
    const logger = createLogger();
    new LoggerProvider(logger).log({ level: 'info', message: 'msg' });
    expect(logger.log).toHaveBeenCalledWith('msg');
  });

  it('should fallback to log for unknown levels', () => {
    const logger = createLogger();
    new LoggerProvider(logger).log({ level: 'unknown' as any, message: 'msg' });
    expect(logger.log).toHaveBeenCalledWith('msg');
  });

  it('should fallback when optional methods are not implemented', () => {
    const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
    const provider = new LoggerProvider(logger);
    provider.log({ level: 'fatal', message: 'f' });
    provider.log({ level: 'debug', message: 'd' });
    provider.log({ level: 'trace', message: 't' });
    expect(logger.error).toHaveBeenCalledWith('f');
    expect(logger.log).toHaveBeenCalledWith('d');
    expect(logger.log).toHaveBeenCalledWith('t');
  });
});
