import fastRedact from 'fast-redact';
import { DEFAULT_OPTIONS_REDACT, REDACT_MODULE_OPTIONS, REDACT_PROVIDER, } from '../constants/redact.constant';
export const redactProvider = () => ({
    provide: REDACT_PROVIDER,
    useFactory: async (_options) => {
        const redactOptions = {
            ...DEFAULT_OPTIONS_REDACT,
            ...(_options || {}),
        };
        const obfuscatedFrom = (_value) => {
            return redactOptions.obfuscateFrom === 'right'
                ? `${_value.toString().substring(0, _value.length - redactOptions.censor.length)}${redactOptions.censor}`
                : `${redactOptions.censor}${_value.toString().substring(redactOptions.censor.length)}`;
        };
        const censor = typeof redactOptions.censor === 'string'
            ? (_value) => obfuscatedFrom(_value)
            : redactOptions.censor;
        return fastRedact({
            ...redactOptions,
            censor,
        });
    },
    inject: [REDACT_MODULE_OPTIONS],
});
