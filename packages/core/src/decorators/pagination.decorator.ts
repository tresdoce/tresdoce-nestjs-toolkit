import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Interface representing pagination parameters.
 * @typedef {Object} PaginationParams
 * @property {number} page - The current page number.
 * @property {number} size - The number of items per page.
 */
export interface PaginationParams {
  page: number;
  size: number;
}

/**
 * Custom decorator that extracts and validates pagination parameters from the request query.
 * It ensures the parameters 'page' and 'size' are within specified limits and are valid integers.
 * The 'page' parameter defaults to 1 if not provided or if invalid.
 * The 'size' parameter defaults to 10 if not provided, if invalid, or if it exceeds the maximum allowed value (MAX_SIZE).
 *
 * @param {unknown} data - The data passed to the decorator. Not used in this case.
 * @param {ExecutionContext} ctx - The execution context, providing access to the incoming request.
 * @returns {PaginationParams} An object containing the 'page' and 'size' after validation.
 *
 * @throws {BadRequestException} If 'page' or 'size' are provided but are not positive integers,
 *                               or if 'size' is provided and exceeds the maximum allowed value (MAX_SIZE).
 *
 * @example
 * // Use within a controller to get pagination parameters.
 * @Get()
 * findAll(@Pagination() pagination: PaginationParams) {
 *   console.log(pagination.page); // Current page number, defaults to 1 if not provided
 *   console.log(pagination.size); // Number of items per page, defaults to 10 if not provided or invalid
 *   // Additional logic to handle the data fetching based on pagination parameters
 * }
 *
 * @example
 * // Query with valid page and size parameters
 * GET /items?page=2&size=20
 * // Query with 'size' exceeding the MAX_SIZE limit
 * GET /items?page=1&size=150  // Will throw BadRequestException
 * // Query without page and size parameters
 * GET /items  // 'page' defaults to 1 and 'size' defaults to 10
 * // Query with invalid page
 * GET /items?page=invalid&size=10  // 'page' defaults to 1
 * // Query with invalid size
 * GET /items?page=2&size=invalid  // 'size' defaults to 10
 */
export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();

    const DEFAULT_PAGE: number = 1;
    const DEFAULT_SIZE: number = 10;
    const MAX_SIZE: number = 100;

    let page: number = Number(request.query.page);
    let size: number = Number(request.query.size);

    if (request.query.page !== undefined && (!Number.isInteger(page) || page < 1)) {
      throw new BadRequestException(
        'The page parameter is invalid. It must be a positive integer.',
      );
    }

    if (
      request.query.size !== undefined &&
      (!Number.isInteger(size) || size < 1 || size > MAX_SIZE)
    ) {
      throw new BadRequestException(
        `The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}.`,
      );
    }

    page = page >= 1 ? page : DEFAULT_PAGE;
    size = size >= 1 && size <= MAX_SIZE ? size : DEFAULT_SIZE;

    return {
      page,
      size,
    };
  },
);
