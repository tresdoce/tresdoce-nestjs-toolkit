import { HttpException, HttpStatus } from '@nestjs/common';
import _ from 'lodash';
import type { ExceptionResponse, IErrorPayload } from '../types.js';

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

  if (exResponse && typeof exResponse === 'object' && typeof exResponse.error === 'string') {
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
  exception: unknown,
): IErrorPayload => {
  const instance = `${_.toUpper(method)} ${url}`;
  const status: number =
    exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  let message: any;
  let detail: any;

  // Custom status codes (e.g. 499) are not part of the HttpStatus enum: fall back to the numeric code.
  const statusName: string = HttpStatus[status] ?? String(status);

  if (exception instanceof HttpException) {
    const exceptionResponse = getErrorMessage(
      exception.getResponse() as ExceptionResponse | string,
      statusName,
    );
    message = exceptionResponse.message;
    detail = exceptionResponse.detail;
  } else if (typeof exception === 'string') {
    message = exception;
  } else {
    // Non-HttpException values (Error, plain objects, null/undefined) must never break the filter.
    message =
      (exception as { message?: unknown } | null | undefined)?.message ??
      _.startCase(_.toLower(statusName));
  }

  return {
    error: {
      status,
      instance,
      code: `${apiPrefix}-${getCode(statusName)}`,
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
  } else if (exceptionResponse) {
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
