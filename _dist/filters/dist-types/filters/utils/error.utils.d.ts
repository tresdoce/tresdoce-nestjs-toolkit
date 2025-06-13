import { ExceptionResponse } from '../types';
/**
 *
 * Extract the stringifies error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
export declare const getCode: (exResponse: ExceptionResponse | string) => string;
/**
 *
 * Extract the error messages
 *
 */
export declare const getErrorMessage: (exceptionResponse: ExceptionResponse | string, httpStatus: string) => ExceptionResponse;
