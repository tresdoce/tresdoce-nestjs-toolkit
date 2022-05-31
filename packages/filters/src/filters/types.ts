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
  message: string;
  status?: number;
  code?: string;
  instance?: string;
  detail?: string[];
  error?: string | IErrorDetail;
  statusCode?: number;
}

export interface IDefaultHTTPErrors {
  [status: number]: string;
}

/*
    {
      "error": {
        "status": 404,
        "code": "<API-PREFIX>-<HTTP-STATUS>",
        "instance": "GET /api/characters",
        "message": "Request failed with status code 404",
        "detail": [
          "firstName must be a string",
          "lastName must be a string",
          "email must be an email",
          "email must be a string"
        ]
      }
    }
    */
