import { ValidationError } from '@nestjs/class-validator';
import { snakeCase, toUpper } from 'lodash';

/**
 *
 * Extract the stringified error code
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

  return '';
};

/**
 *
 * Extract the error messages
 *
 */
export const getErrorMessage = (exResponse: ExceptionResponse | string): string => {
  if (typeof exResponse === 'string') {
    return exResponse;
  }

  if (typeof exResponse.message === 'string') {
    return exResponse.message;
  }

  if (Array.isArray(exResponse.message)) {
    // process the first error message
    const error: ValidationError | string = exResponse.message[0];
    if (typeof error === 'string') {
      return error;
    }

    const validationError: string = parseErrorMessage(error);
    if (validationError) {
      return validationError;
    }
  }

  if (typeof exResponse === 'object') {
    return exResponse.error;
  }
};

/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
const formatErrorCode = (error: string): string => {
  return toUpper(snakeCase(error));
};

/*
 *
 * Aggregation of error messages for a given ValidationError
 *
 */
const parseErrorMessage = (error: ValidationError): string => {
  let message = '';
  const messages: Constraint | undefined = findConstraints(error);

  if (messages === undefined) {
    return 'Invalid parameter';
  }

  Object.keys(messages).forEach((key: string): void => {
    message += `${message === '' ? '' : ' -- '}${messages[key]}`;
  });

  return message;
};

/**
 *
 * Find contraints in an error oject
 *
 */
const findConstraints = (error): Constraint | undefined => {
  let objectToIterate: ValidationError = error;
  objectToIterate.constraints = error;
  while (objectToIterate.children !== undefined) {
    objectToIterate = objectToIterate.children[0];
  }

  return objectToIterate.constraints;
};

/**
 *
 * Contraints of the validation
 *
 */
interface Constraint {
  [type: string]: string;
}

/**
 *
 * Exception response
 *
 */
interface ExceptionResponse {
  error?: string;
  message?: string | string[] | ValidationError[];
}
