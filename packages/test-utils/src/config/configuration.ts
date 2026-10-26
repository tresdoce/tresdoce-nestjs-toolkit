import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

import { appConfigBase } from '../fixtures/appConfigBase.js';

export default registerAs('config', (): Typings.AppConfig => appConfigBase);
