import { AmqpError, EventContext } from 'rhea-promise';
import { ErrorMessage } from '../lib/utils/error-message.utils';

describe('ErrorMessage', () => {
  describe('toString', () => {
    it('should return undefined', () => {
      const result = ErrorMessage.toString(null);
      expect(result).toBeUndefined();
    });

    it('should return string', () => {
      const result = ErrorMessage.toString('demo');
      expect(result).toBe('demo');
    });

    it('should return object message', () => {
      const result = ErrorMessage.toString({ foo: 'bar' });
      expect(result).toBe('{"foo":"bar"}');
    });
  });

  describe('fromError', () => {
    it('should return `undefined`', () => {
      const result = ErrorMessage.fromError(null);
      expect(result).toBe(undefined);
    });

    it('should return error message', () => {
      const error = new Error('demo');
      const result = ErrorMessage.fromError(error);
      expect(result).toBe('demo');
    });
  });

  describe('fromErrorAmqp', () => {
    it('should return `undefined`', () => {
      const result = ErrorMessage.fromErrorAmqp(null);
      expect(result).toBe(undefined);
    });

    it('should return error message', () => {
      const error = new Error('demo');
      const result = ErrorMessage.fromErrorAmqp(error);
      expect(result).toBe('demo');
    });

    it('should return error description', () => {
      const error: AmqpError = {
        description: 'foo: bar',
      };
      const result = ErrorMessage.fromErrorAmqp(error);
      expect(result).toBe('foo: bar');
    });
  });

  describe('fromContext', () => {
    it('should return `undefined`', () => {
      const result = ErrorMessage.fromContext(null);
      expect(result).toBeUndefined();
    });

    it('should return error message', () => {
      const context = {
        error: new Error('demo'),
      } as EventContext;
      const result = ErrorMessage.fromContext(context);
      expect(result).toBe('demo');
    });
  });

  describe('fromReceiver', () => {
    it('should return `undefined`', () => {
      const result = ErrorMessage.fromReceiver(null);
      expect(result).toBeUndefined();
    });

    it('should return error message', () => {
      const context = {
        receiver: {
          error: new Error('demo'),
        },
      } as EventContext;
      const result = ErrorMessage.fromReceiver(context);
      expect(result).toBe('demo');
    });
  });

  describe('fromSender', () => {
    it('should return `undefined`', () => {
      const result = ErrorMessage.fromSender(null);
      expect(result).toBeUndefined();
    });

    it('should return error message', () => {
      const context = {
        sender: {
          error: new Error('demo'),
        },
      } as EventContext;
      const result = ErrorMessage.fromSender(context);
      expect(result).toBe('demo');
    });
  });
});
