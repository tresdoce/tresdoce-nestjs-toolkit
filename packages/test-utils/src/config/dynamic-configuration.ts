import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

import { appConfigBase } from '../fixtures/index';

export const dynamicConfig = ({ ...args } = {}) =>
  registerAs('config', (): Typings.AppConfig => ({ ...appConfigBase, ...args }));
