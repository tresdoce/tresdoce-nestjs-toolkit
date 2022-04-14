import { HttpStatus, ValidationError } from '@nestjs/common';
import { getCode, getErrorMessage } from '../lib/utils/error.utils';

describe('error.utils', () => {
  it('should be return code in string', () => {
    const code = getCode(HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR]);
    expect(code).toEqual('INTERNAL_SERVER_ERROR');
  });

  it('should be return code in string obj', () => {
    const code = getCode({ error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR] });
    expect(code).toEqual('INTERNAL_SERVER_ERROR');
  });

  it('should be return empty in string obj', () => {
    const code = getCode({ message: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR] });
    expect(code).toEqual('');
  });

  it('should be return message from obj', () => {
    const message = getErrorMessage({
      message: 'this is a message',
      error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
    });
    expect(message).toEqual('this is a message');
  });

  it('should be return message from string', () => {
    const message = getErrorMessage('this is a message');
    expect(message).toEqual('this is a message');
  });

  it('should be return message from array', () => {
    const message = getErrorMessage({
      message: ['this is a message', 'this is a message 2'],
      error: HttpStatus[HttpStatus.BAD_REQUEST],
    });
    expect(message).toEqual('this is a message');
  });

  it('should be return message from validationError', () => {
    const message = getErrorMessage({
      message: '',
      error: HttpStatus[HttpStatus.BAD_REQUEST],
    });
    expect(message).toEqual('');
  });

  it('should be return message from validationError without constraints', () => {
    const validationError: ValidationError = {
      property: 'firstName',
    };
    const message = getErrorMessage({
      message: [validationError],
      error: HttpStatus[HttpStatus.BAD_REQUEST],
    });
    expect(message).toEqual('firstName -- [object Object]');
  });

  it('should be return message from object', () => {
    const message = getErrorMessage({
      error: 'this is a message',
    });
    expect(message).toEqual('this is a message');
  });
});
