import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

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
 * Interface representing sorting parameters.
 * @typedef {Object} SortingParams
 * @property {SortCriteria[]} fields - An array of sorting criteria.
 */
export interface SortingParams {
  fields: SortCriteria[];
}

/**
 * Custom decorator that extracts and validates sorting parameters from the request query.
 * It parses the 'sort' parameter, which can be a comma-separated list of fields with optional
 * sorting direction ('asc' or 'desc') specified using a colon. The default sorting direction is
 * defined by DEFAULT_SORT_DIRECTION if not provided.
 *
 * @param {string[]} data - A list of valid field names that can be used for sorting.
 * @param {ExecutionContext} ctx - The execution context, providing access to the incoming request.
 * @returns {SortingParams} An object containing the sorting parameters.
 *
 * @throws {BadRequestException} If the 'sort' parameter format is invalid, if a field is not in the list of validParams,
 *                               or if the configuration for sorting parameters is invalid.
 *
 * @example
 * // Use within a controller to get sorting parameters.
 * @Get()
 * findAll(@Sorting(['user_id', 'first_name']) sorting: SortingParams) {
 *   console.log(sorting.fields); // Array of sorting fields and directions
 *   // Additional logic to handle the data fetching based on sorting parameters
 * }
 *
 * @example
 * // Query with sorting parameters
 * GET /items?sort=user_id:asc,first_name:desc
 * // Query with default sorting direction
 * GET /items?sort=user_id
 * // Query with an invalid field (not included in validParams)
 * GET /items?sort=invalid_field:asc // Will throw BadRequestException
 */
export const Sorting = createParamDecorator(
  (data: string[], ctx: ExecutionContext): SortingParams => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();

    const DEFAULT_SORT_DIRECTION: SortOrder = 'asc';

    const sortParam: string = request.query.sort as string;

    if (!sortParam) {
      return { fields: [] };
    }

    if (!Array.isArray(data)) {
      throw new BadRequestException('Invalid configuration for sorting parameters');
    }

    const sortFields: SortCriteria[] = sortParam.split(',').map((sortField) => {
      //const sortPattern = /^([a-zA-Z0-9_]+)(?::(asc|desc))?$/;
      const sortPattern = /^(\w+)(?::(asc|desc))?$/;

      //if (!sortField.match(sortPattern)) {
      if (!sortPattern.exec(sortField)) {
        throw new BadRequestException(
          `Invalid sort parameter: "${sortField}". It must be in the format 'field_name[:direction]' where direction is 'asc' or 'desc' and is optional.`,
        );
      }

      const [field, order = DEFAULT_SORT_DIRECTION] = sortField.split(':');
      if (!data.includes(field)) {
        throw new BadRequestException(`Invalid sort property: ${field}`);
      }

      return { field, order: order as SortOrder };
    });

    return {
      fields: sortFields,
    };
  },
);
