import { RedactModuleOptions } from '../interfaces';

export const REDACT_MODULE_OPTIONS = Symbol('REDACT_MODULE_OPTIONS');
export const REDACT_PROVIDER = Symbol('REDACT_PROVIDER');
export const DEFAULT_CENSOR = '****';
export const DEFAULT_OPTIONS_REDACT: RedactModuleOptions = {
  paths: [],
  obfuscateFrom: 'right',
  censor: DEFAULT_CENSOR,
  remove: false,
  strict: false,
  serialize: false,
};
