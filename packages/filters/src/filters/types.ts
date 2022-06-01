import { ValidationError } from '@nestjs/class-validator';

export interface ExceptionResponse {
  error?: string;
  detail?: string;
  message?: string | string[] | ValidationError[];
}

export interface IProblemDetail {
  status: number;
  instance?: string;
  code?: string;
  message: string;
  detail?: string | string[] | ValidationError[] | object;
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
