import { Provider } from '@nestjs/common';
import fastRedact from 'fast-redact';

import {
  DEFAULT_OPTIONS_REDACT,
  REDACT_MODULE_OPTIONS,
  REDACT_PROVIDER,
} from '../constants/redact.constant.js';
import type { RedactModuleOptions } from '../interfaces/index.js';

/**
 * Ofusca parcialmente un string reemplazando, desde `obfuscateFrom`, tantos caracteres como
 * tenga el `censor`. Los valores que no son string (números, booleanos, objetos, arrays) se
 * reemplazan por el `censor` completo para no filtrar datos ni serializar `[object Object]`.
 */
export const obfuscateValue = (
  value: unknown,
  censor: string,
  obfuscateFrom: RedactModuleOptions['obfuscateFrom'] = 'right',
): string => {
  if (typeof value !== 'string') return censor;
  return obfuscateFrom === 'right'
    ? `${value.substring(0, value.length - censor.length)}${censor}`
    : `${censor}${value.substring(censor.length)}`;
};

export const redactProvider = (): Provider => ({
  provide: REDACT_PROVIDER,
  useFactory: async (_options: RedactModuleOptions | null): Promise<fastRedact.redactFn> => {
    const redactOptions: RedactModuleOptions = {
      ...DEFAULT_OPTIONS_REDACT,
      ..._options,
    };
    const { censor: censorOption, obfuscateFrom } = redactOptions;

    const censor =
      typeof censorOption === 'string'
        ? (value: unknown): string => obfuscateValue(value, censorOption, obfuscateFrom)
        : censorOption;

    return fastRedact({
      ...redactOptions,
      censor,
    });
  },
  inject: [REDACT_MODULE_OPTIONS],
});
