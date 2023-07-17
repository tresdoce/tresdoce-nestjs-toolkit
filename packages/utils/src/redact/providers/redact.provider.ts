import { Provider } from '@nestjs/common';
import fastRedact from 'fast-redact';

import {
  DEFAULT_OPTIONS_REDACT,
  REDACT_MODULE_OPTIONS,
  REDACT_PROVIDER,
} from '../constants/redact.constant';
import { RedactModuleOptions } from '../interfaces';

export const redactProvider = (): Provider => ({
  provide: REDACT_PROVIDER,
  useFactory: async (_options: RedactModuleOptions): Promise<any> => {
    const redactOptions: RedactModuleOptions = {
      ...DEFAULT_OPTIONS_REDACT,
      ...(_options || {}),
    };

    const obfuscatedFrom = (_value): string => {
      return redactOptions.obfuscateFrom === 'right'
        ? `${_value.toString().substring(0, _value.length - redactOptions.censor.length)}${
            redactOptions.censor
          }`
        : `${redactOptions.censor}${_value.toString().substring(redactOptions.censor.length)}`;
    };

    const censor =
      typeof redactOptions.censor === 'string'
        ? (_value): string => obfuscatedFrom(_value)
        : redactOptions.censor;

    return fastRedact({
      ...redactOptions,
      censor,
    });
  },
  inject: [REDACT_MODULE_OPTIONS],
});
