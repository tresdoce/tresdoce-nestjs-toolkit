import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { formatRegex, ruleRegex } from './constants/filtering.constant';

/**
 * Enum representing valid filter rules for query parameters.
 */
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
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
export const convertFilterValue = (rule: FilterRule, value: string): any => {
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
export const parseFilters = (filterParam: string): string[] => {
  const filters: string[] = [];
  let buffer: string = '';
  let isInValue: boolean = false;

  for (const char of filterParam) {
    if ((char === ':' && buffer.endsWith('in')) || buffer.endsWith('nin')) {
      isInValue = true;
    } else if (char === ',' && !isInValue) {
      filters.push(buffer);
      buffer = '';
      continue;
    } else if (char === ',' && isInValue) {
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
export const FilteringParams = createParamDecorator(
  (validProperties: string[], ctx: ExecutionContext): Filtering<any>[] => {
    const request: Request = ctx.switchToHttp().getRequest<Request>();
    const filterParam = request.query.filters as string;
    if (!filterParam) return [];

    if (!Array.isArray(validProperties)) {
      throw new BadRequestException('Invalid filter configuration');
    }

    const filters = parseFilters(filterParam);

    return filters.map((filter) => {
      const formatMatch = formatRegex.exec(filter);
      if (!formatMatch) {
        throw new BadRequestException(
          `Invalid filter format, expected 'property:rule[:value]: ${filter}`,
        );
      }

      const [, property, rule, valueString] = formatMatch;
      if (!validProperties.includes(property)) {
        throw new BadRequestException(`Invalid filter property: ${property}`);
      }
      /* istanbul ignore next */
      if (!Object.values(FilterRule).includes(rule as FilterRule) && !ruleRegex.exec(rule)) {
        /* istanbul ignore next */
        throw new BadRequestException(`Invalid filter rule: ${rule}`);
      }

      let values: any[] = [];

      if (valueString) {
        if (rule === FilterRule.IN || rule === FilterRule.NOT_IN) {
          values = valueString
            .split(',')
            .map((value) => convertFilterValue(rule as FilterRule, value));
        } else {
          values = [convertFilterValue(rule as FilterRule, valueString)];
        }
      }

      return { property, rule: rule as FilterRule, values: values.filter((v) => v !== undefined) };
    });
  },
);
