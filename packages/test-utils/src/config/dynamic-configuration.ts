import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

import { appConfigBase } from '../fixtures';

export const dynamicConfig = ({ ...args } = {}) =>
  registerAs('config', (): Typings.AppConfig => ({ ...appConfigBase, ...args }));
