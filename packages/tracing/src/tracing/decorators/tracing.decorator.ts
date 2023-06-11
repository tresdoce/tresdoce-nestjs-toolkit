import { SetMetadata } from '@nestjs/common';
import { SKIP_TRACE } from '../constants/tracing.constant';

export const SkipTrace = () => SetMetadata(SKIP_TRACE, true);
