import { HttpException, HttpStatus } from '@nestjs/common';
import _ from 'lodash';
import { ExceptionResponse } from '../types';

/**
 *
 * Extract the stringifies error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
export const getCode = (exResponse: ExceptionResponse | string): string => {
  if (typeof exResponse === 'string') {
    return formatErrorCode(exResponse);
  }

  if ('error' in exResponse && typeof exResponse.error === 'string') {
    return formatErrorCode(exResponse.error);
  }

  return formatErrorCode(HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR]);
};

/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
const formatErrorCode = (error: string): string => {
  return _.toUpper(_.snakeCase(error));
};

/**
 * Builds a normalized error payload from an exception.
 * Shared between ExceptionsFilter and ElkService to avoid logic duplication.
 */
export const buildErrorPayload = (
  apiPrefix: string,
  method: string,
  url: string,
  exception: any,
): { error: { status: number; instance: string; code: string; message: any; detail: any } } => {
  const instance = `${_.toUpper(method)} ${url}`;
  let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: any;
  let detail: any;

  if (exception instanceof HttpException) {
    status = exception.getStatus();
    const exceptionResponse = getErrorMessage(exception.getResponse(), HttpStatus[status]);
    message = exceptionResponse.message;
    detail = exceptionResponse.detail;
  } else {
    message = exception.message;
  }

  return {
    error: {
      status,
      instance,
      code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
      message,
      detail,
    },
  };
};

/**
 *
 * Extract the error messages
 *
 */
export const getErrorMessage = (
  exceptionResponse: ExceptionResponse | string,
  httpStatus: string,
): ExceptionResponse => {
  let message;
  let detail;

  if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
  } else {
    if (_.isArray(exceptionResponse.message)) {
      message = exceptionResponse.error;
      detail = _.map(exceptionResponse.message, (_message) => ({ message: _message }));
    } else {
      message = exceptionResponse.message;
      detail = exceptionResponse.error;
    }
  }

  return {
    message: message || _.startCase(_.toLower(httpStatus)),
    detail,
  };
};
