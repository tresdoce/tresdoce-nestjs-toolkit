import { HttpStatus } from '@nestjs/common';
import _ from 'lodash';
import { ExceptionResponse } from '../types';
import messages from '@pika/pack/dist-types/reporters/lang/en';

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
      detail = _.map(exceptionResponse.message, (message) => ({ message }));
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
