import { HttpException, HttpStatus } from '@nestjs/common';
import { buildErrorPayload, getCode, getErrorMessage } from '../index.js';

describe('error.utils', () => {
  describe('getCode', () => {
    it('should return the code from a string', () => {
      expect(getCode(HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR])).toEqual(
        'INTERNAL_SERVER_ERROR',
      );
    });

    it('should return the code from an object with error', () => {
      expect(getCode({ error: 'Bad Request' })).toEqual('BAD_REQUEST');
    });

    it('should fallback to INTERNAL_SERVER_ERROR when error is not a string', () => {
      expect(getCode({ error: HttpStatus['TEST_ERROR'] })).toEqual('INTERNAL_SERVER_ERROR');
    });

    it('should fallback to INTERNAL_SERVER_ERROR for nullish values', () => {
      expect(getCode(undefined as any)).toEqual('INTERNAL_SERVER_ERROR');
      expect(getCode(null as any)).toEqual('INTERNAL_SERVER_ERROR');
    });
  });

  describe('getErrorMessage', () => {
    it('should fallback to the status name when the response is empty', () => {
      expect(getErrorMessage(undefined as any, 'NOT_FOUND')).toEqual({
        message: 'Not Found',
        detail: undefined,
      });
    });
  });

  describe('buildErrorPayload', () => {
    it('should build the payload for an HttpException', () => {
      expect(
        buildErrorPayload('MY-API', 'delete', '/api/users/1', new HttpException('Gone', 410)),
      ).toEqual({
        error: {
          status: 410,
          instance: 'DELETE /api/users/1',
          code: 'MY-API-GONE',
          message: 'Gone',
          detail: undefined,
        },
      });
    });
  });
});
