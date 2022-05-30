import { ValidationError } from '@nestjs/class-validator';

export interface ExceptionResponse {
  error?: string;
  message?: string | string[] | ValidationError[];
}

export interface IProblemDetail {
  status: number;
  title: string;
  type: string;
  detail?: string;
  instance?: string;
  code?: string;
  [key: string]: unknown;
}

export interface IErrorDetail {
  message: string;
  error?: {
    type?: string;
    instance?: string;
    detail?: string;
    code?: string;
  };
}

export interface IExceptionResponse {
  error?: string | IErrorDetail;
  message: string;
  type?: string;
  instance?: string;
  status: number;
  code: string;
}

export interface IDefaultHTTPErrors {
  [status: number]: string;
}
