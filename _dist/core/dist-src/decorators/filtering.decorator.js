import { createParamDecorator, BadRequestException } from '@nestjs/common';
import { formatRegex, ruleRegex } from './constants/filtering.constant';
/**
 * Enum representing valid filter rules for query parameters.
 */
export var FilterRule;
(function (FilterRule) {
    FilterRule["EQUALS"] = "eq";
    FilterRule["NOT_EQUALS"] = "neq";
    FilterRule["GREATER_THAN"] = "gt";
    FilterRule["GREATER_THAN_OR_EQUALS"] = "gte";
    FilterRule["LESS_THAN"] = "lt";
    FilterRule["LESS_THAN_OR_EQUALS"] = "lte";
    FilterRule["LIKE"] = "like";
    FilterRule["NOT_LIKE"] = "nlike";
    FilterRule["IN"] = "in";
    FilterRule["NOT_IN"] = "nin";
    FilterRule["IS_NULL"] = "isnull";
    FilterRule["IS_NOT_NULL"] = "isnotnull";
})(FilterRule || (FilterRule = {}));
/**
 * Converts a filter value string to the appropriate type based on the filter rule.
 * @param rule - The filter rule.
 * @param value - The string value to convert.
 * @returns The value converted to the appropriate type, or undefined for IS_NULL and IS_NOT_NULL rules.
 */
export const convertFilterValue = (rule, value) => {
    /* istanbul ignore next */
    switch (rule) {
        case FilterRule.IN:
        case FilterRule.NOT_IN:
            return value;
        case FilterRule.IS_NULL:
        case FilterRule.IS_NOT_NULL:
            /* istanbul ignore next */
            return;
        case FilterRule.GREATER_THAN:
        case FilterRule.GREATER_THAN_OR_EQUALS:
        case FilterRule.LESS_THAN:
        case FilterRule.LESS_THAN_OR_EQUALS:
            return Number(value);
        case FilterRule.EQUALS:
        case FilterRule.NOT_EQUALS:
            return isNaN(Number(value)) ? value : Number(value);
        default:
            return value;
    }
};
/**
 * Divide una cadena de parámetros de filtro en filtros individuales, teniendo en cuenta las reglas IN y NOT_IN.
 * Las reglas IN y NOT_IN pueden contener comas en sus valores, por lo que esta función asegura que dichas comas no se usen para dividir la cadena.
 *
 * @param {string} filterParam - La cadena de parámetros de filtro completa de la solicitud.
 * @returns {string[]} Un array de cadenas, cada una representando un filtro individual.
 */
export const parseFilters = (filterParam) => {
    const filters = [];
    let buffer = '';
    let isInValue = false;
    for (const char of filterParam) {
        if ((char === ':' && buffer.endsWith('in')) || buffer.endsWith('nin')) {
            isInValue = true;
        }
        else if (char === ',' && !isInValue) {
            filters.push(buffer);
            buffer = '';
            continue;
        }
        else if (char === ',' && isInValue) {
            isInValue = false;
        }
        buffer += char;
    }
    if (buffer) {
        filters.push(buffer);
    }
    return filters;
};
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
export const FilteringParams = createParamDecorator((validProperties, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const filterParam = request.query.filters;
    if (!filterParam)
        return [];
    if (!Array.isArray(validProperties)) {
        throw new BadRequestException('Invalid filter configuration');
    }
    const filters = parseFilters(filterParam);
    return filters.map((filter) => {
        const formatMatch = formatRegex.exec(filter);
        if (!formatMatch) {
            throw new BadRequestException(`Invalid filter format, expected 'property:rule[:value]: ${filter}`);
        }
        const [, property, rule, valueString] = formatMatch;
        if (!validProperties.includes(property)) {
            throw new BadRequestException(`Invalid filter property: ${property}`);
        }
        /* istanbul ignore next */
        if (!Object.values(FilterRule).includes(rule) && !ruleRegex.exec(rule)) {
            /* istanbul ignore next */
            throw new BadRequestException(`Invalid filter rule: ${rule}`);
        }
        let values = [];
        if (valueString) {
            if (rule === FilterRule.IN || rule === FilterRule.NOT_IN) {
                values = valueString
                    .split(',')
                    .map((value) => convertFilterValue(rule, value));
            }
            else {
                values = [convertFilterValue(rule, valueString)];
            }
        }
        return { property, rule: rule, values: values.filter((v) => v !== undefined) };
    });
});
