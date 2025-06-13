/**
 * Parses a comma-separated string of health checks to skip and returns an array of skipped health checks.
 *
 * @param {string} _value - The comma-separated string of health checks to skip.
 * @returns {TSkipHealthChecks[]} An array of health checks to skip. Possible values include 'storage', 'memory', and 'observability'.
 *
 * @example
 * // Usage example:
 * const skipChecksString = 'storage,memory';
 * const skippedChecks = getSkipHealthChecks(skipChecksString);
 * console.log(skippedChecks);
 *
 * // Output:
 * // ['storage', 'memory']
 *
 * @returns {TSkipHealthChecks[]} An array of health checks to skip.
 */
export const getSkipHealthChecks = (_value) => {
    return _value
        ? _value.split(',').map((_item) => _item.toLowerCase().trim())
        : [];
};
/**
 * Calculates pagination metadata based on the provided parameters.
 *
 * @param {PaginateDataParams} params - The pagination parameters.
 * @returns {IPaginateData} The paginated data with metadata.
 *
 * @example
 * // Usage example:
 * const params = {
 *   total: 100,
 *   page: 2,
 *   size: 10,
 * };
 *
 * const paginatedData = calculatePagination(params);
 * console.log(paginatedData);
 *
 * // Output:
 * // {
 * //   page: 2,
 * //   size: 10,
 * //   total: 100,
 * //   totalPages: 10,
 * //   hasNext: true,
 * //   hasPrevious: true
 * // }
 *
 * @returns {IPaginateData} The paginated data with metadata.
 */
export const calculatePagination = ({ total, page, size }) => ({
    page,
    size,
    total,
    totalPages: Math.ceil(total / size),
    hasNext: page < Math.ceil(total / size),
    hasPrevious: page > 1,
});
