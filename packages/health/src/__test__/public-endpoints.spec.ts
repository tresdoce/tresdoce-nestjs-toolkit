import { IS_PUBLIC_KEY } from '@tresdoce-nestjs-toolkit/core';

import { LivenessController } from '../health/controllers/liveness.controller.js';
import { ReadinessController } from '../health/controllers/readiness.controller.js';

describe('Health endpoints are public', () => {
  it('should mark liveness as @Public() (skips global JwtAuthGuard)', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, LivenessController.prototype.getLiveness)).toBe(true);
  });

  it('should mark readiness as @Public() (skips global JwtAuthGuard)', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ReadinessController.prototype.check)).toBe(true);
  });
});
