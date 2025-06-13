import { SetMetadata } from '@nestjs/common';
export const EXCLUDE_FILTER_KEY = 'excludeFilter';
export const ExcludeFilter = () => SetMetadata(EXCLUDE_FILTER_KEY, true);
