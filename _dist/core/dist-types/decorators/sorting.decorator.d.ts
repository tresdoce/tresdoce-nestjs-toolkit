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
export declare const Sorting: (...dataOrPipes: (string[] | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
