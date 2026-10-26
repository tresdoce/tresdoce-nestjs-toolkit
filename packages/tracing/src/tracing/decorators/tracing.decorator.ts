import { SetMetadata } from '@nestjs/common';
import { SKIP_TRACE } from '../constants/tracing.constant.js';

/** Omite la traza del `TracingInterceptor` en un handler o en todo un controller. */
export const SkipTrace = () => SetMetadata(SKIP_TRACE, true);
