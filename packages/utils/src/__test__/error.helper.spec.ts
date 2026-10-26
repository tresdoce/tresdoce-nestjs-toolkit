import { getErrorMessage } from '../bcrypt/helpers/error.helper.js';

describe('getErrorMessage', () => {
  it('should return the message of an Error instance', () => {
    expect(getErrorMessage(new TypeError('boom'))).toBe('boom');
  });

  it('should stringify non Error values', () => {
    expect(getErrorMessage('plain string')).toBe('plain string');
    expect(getErrorMessage(42)).toBe('42');
    expect(getErrorMessage({ code: 'E_FAIL' })).toBe('{"code":"E_FAIL"}');
    expect(getErrorMessage(undefined)).toBe('undefined');
  });
});
