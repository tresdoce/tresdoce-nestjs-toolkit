import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

import { appConfigBase } from '../fixtures';

export default registerAs('config', (): Typings.AppConfig => appConfigBase);
