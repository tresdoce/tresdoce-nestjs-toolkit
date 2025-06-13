/**
 * Enum representing valid filter rules for query parameters.
 */
export declare enum FilterRule {
    EQUALS = "eq",
    NOT_EQUALS = "neq",
    GREATER_THAN = "gt",
    GREATER_THAN_OR_EQUALS = "gte",
    LESS_THAN = "lt",
    LESS_THAN_OR_EQUALS = "lte",
    LIKE = "like",
    NOT_LIKE = "nlike",
    IN = "in",
    NOT_IN = "nin",
    IS_NULL = "isnull",
    IS_NOT_NULL = "isnotnull"
}
/**
 * Interface representing a single filtering criterion.
 * @template T - The type of the value(s) for the filtering criterion.
 */
export interface Filtering<T = string | number | boolean | string[]> {
    property: string;
    rule: FilterRule;
    values: T[];
}
/**
 * Converts a filter value string to the appropriate type based on the filter rule.
 * @param rule - The filter rule.
 * @param value - The string value to convert.
 * @returns The value converted to the appropriate type, or undefined for IS_NULL and IS_NOT_NULL rules.
 */
export declare const convertFilterValue: (rule: FilterRule, value: string) => any;
/**
 * Divide una cadena de parámetros de filtro en filtros individuales, teniendo en cuenta las reglas IN y NOT_IN.
 * Las reglas IN y NOT_IN pueden contener comas en sus valores, por lo que esta función asegura que dichas comas no se usen para dividir la cadena.
 *
 * @param {string} filterParam - La cadena de parámetros de filtro completa de la solicitud.
 * @returns {string[]} Un array de cadenas, cada una representando un filtro individual.
 */
export declare const parseFilters: (filterParam: string) => string[];
/**
 * Decorator that extracts and validates filtering parameters from the request query.
 * It parses the 'filter' parameter which can be a comma-separated list of property:rule[:value] entries.
 * @param validProperties - Array of valid property names that can be used for filtering.
 * @param ctx - The execution context, providing access to the incoming request.
 * @returns An array of Filtering objects, each representing a filter criterion.
 * @throws BadRequestException if the filter parameter format is invalid or a property/rule is not in the list of valid options.
 *
 * @example
 * // Use within a controller to get filtering parameters.
 * @Get()
 * findAll(@FilteringParams(['age', 'name']) filters: Filtering<any>[]) {
 *   filters.forEach(filter => {
 *     console.log(filter.property); // property name
 *     console.log(filter.rule); // filter rule
 *     console.log(filter.values); // array of values
 *   });
 *   // Additional logic to handle data fetching based on filter parameters.
 * }
 *
 * @example
 * // Query with a single filter parameter
 * GET /items?filter=age:gt:30
 *
 * @example
 * // Query with multiple filter parameters
 * GET /items?filter=age:gt:30,name:like:John,status:in:active,inactive
 */
export declare const FilteringParams: (...dataOrPipes: (string[] | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
