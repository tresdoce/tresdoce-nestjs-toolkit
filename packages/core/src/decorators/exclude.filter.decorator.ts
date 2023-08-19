import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const EXCLUDE_FILTER_KEY = 'excludeFilter';
export const ExcludeFilter = (): CustomDecorator => SetMetadata(EXCLUDE_FILTER_KEY, true);
