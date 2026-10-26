import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '@tresdoce-nestjs-toolkit/config/vitest';

export default mergeConfig(baseConfig, defineProject({ test: { name: 'qrcode' } }));
