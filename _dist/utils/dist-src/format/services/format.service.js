var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DEFAULT_FORMAT_DATE, DEFAULT_LOCALE, DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF, DEFAULT_TIMEZONE, } from '../constants/format.constant';
import { TimeSuffixes, } from '../interfaces/format.interface';
let FormatService = class FormatService {
    /**
     * @Descripción: Return number with format
     * @Param _options {FormatNumberOptions}
     * @return: string
     */
    formatNumber(_options) {
        const { num, locale = DEFAULT_LOCALE, formatOptions } = _options;
        return new Intl.NumberFormat(locale, formatOptions).format(num).replace(/\u00A0/g, ' ');
    }
    /**
     * @Descripción: Return luxon DateTime instance
     * @return: DateTime
     */
    dateTimeRef() {
        return DateTime;
    }
    /**
     * @Descripción: Return date with format
     * @Param _options {FormatDateOptions}
     * @return: string
     */
    formatDate(_options) {
        const { date, formatDate = DEFAULT_FORMAT_DATE, timezone = DEFAULT_TIMEZONE, locale = DEFAULT_LOCALE, } = _options;
        return this.dateTimeRef()
            .fromJSDate(date, { zone: timezone })
            .setLocale(locale)
            .toFormat(formatDate);
    }
    /**
     * @Descripción: Return convert date to ISO
     * @Param _options {ISOFormatDateOptions}
     * @return: string
     */
    dateToISO(_options) {
        const { date, timezone = DEFAULT_TIMEZONE } = _options;
        return this.dateTimeRef().fromJSDate(date, { zone: timezone }).toISO();
    }
    /**
     * @Descripción: Return diff between two timestamps
     * @Param _options {CalculateTimestampDiffOptions}
     * @return: string | number
     */
    calculateTimestampDiff(_options) {
        const { startTime, endTime, options } = _options;
        const diffOptions = { ...DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF, ...options };
        const start = this.dateTimeRef().fromMillis(startTime);
        const end = this.dateTimeRef().fromMillis(endTime);
        const duration = end.diff(start).as(diffOptions.unit);
        return diffOptions.addSuffix ? `${duration}${TimeSuffixes[diffOptions.unit]}` : duration;
    }
};
FormatService = __decorate([
    Injectable()
], FormatService);
export { FormatService };
