import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DEFAULT_SORT_DIRECTION, sortPattern } from './constants/sorting.constant';

/**
 * Type representing the order of sorting.
 * It can either be 'asc' for ascending order or 'desc' for descending order.
 * @typedef {'asc' | 'desc'} SortOrder
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Interface representing individual sorting criteria.
 * @typedef {Object} SortCriteria
 * @property {string} field - The field name to sort by.
 * @property {SortOrder} order - The order of sorting, either 'asc' or 'desc'.
 */
export interface SortCriteria {
  field: string;
  order: SortOrder;
}

/**
 * Custom decorator that extracts and validates sorting parameters from the request query.
 * It parses the 'sort' parameter, which can be a comma-separated list of fields with optional
 * sorting direction ('asc' or 'desc') specified using a colon. The default sorting direction is
 * defined by DEFAULT_SORT_DIRECTION if not provided.
 *
 * @param {string[]} sortingFieldNames - A list of valid field names that can be used for sorting.
 * @param {ExecutionContext} ctx - The execution context, providing access to the incoming request.
 * @returns {SortCriteria[]} An array of sorting criteria.
 *
 * @throws {BadRequestException} If the 'sort' parameter format is invalid, if a field is not in the list of sortingFieldNames,
 *                               or if the configuration for sorting parameters is invalid.
 *
 * @example
 * // Use within a controller to get sorting parameters.
 * @Get()
 * findAll(@Sorting(['user_id', 'first_name']) sorting: SortCriteria[]) {
 *   console.log(sorting); // Array of sorting fields and directions
 *   // Additional logic to handle the data fetching based on sorting parameters
 * }
 *
 * @example
 * // Query with sorting parameters
 * GET /items?sort=user_id:asc,first_name:desc
 * // Query with default sorting direction
 * GET /items?sort=user_id
 * // Query with an invalid field (not included in sortingFieldNames)
 * GET /items?sort=invalid_field:asc // Will throw BadRequestException
 */
export const Sorting = createParamDecorator(
  (sortingFieldNames: string[], ctx: ExecutionContext): SortCriteria[] => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    const sortParam: string = request.query.sort as string;

    if (!sortParam) {
      return [];
    }

    if (!Array.isArray(sortingFieldNames)) {
      throw new BadRequestException('Invalid configuration for sorting parameters.');
    }

    return sortParam.split(',').map((sortField) => {
      if (!sortPattern.exec(sortField)) {
        throw new BadRequestException(
          `The sorting parameter "${sortField}" is invalid. It should have the format 'field_name[:direction]', where direction is 'asc' or 'desc' and is optional.`,
        );
      }

      const [field, order = DEFAULT_SORT_DIRECTION] = sortField.split(':');
      if (!sortingFieldNames.includes(field)) {
        throw new BadRequestException(
          `The sorting property "${field}" is invalid. It should be one of the following: ${sortingFieldNames.join(', ')}.`,
        );
      }

      return { field, order: order as SortOrder };
    });
  },
);
