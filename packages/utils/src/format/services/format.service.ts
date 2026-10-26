import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import {
  DEFAULT_FORMAT_DATE,
  DEFAULT_LOCALE,
  DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF,
  DEFAULT_TIMEZONE,
} from '../constants/format.constant.js';
import {
  CalculateTimestampDiffOptions,
  FormatDateOptions,
  FormatNumberOptions,
  ISOFormatDateOptions,
  TimeSuffixes,
  type TimestampDiffOptions,
} from '../interfaces/format.interface.js';

/**
 * ICU (Node 20+/22+) usa espacios especiales: NO-BREAK SPACE (U+00A0) y NARROW NO-BREAK SPACE
 * (U+202F) en separadores de miles, monedas y meridianos (`a. m.`, `12:00 AM`).
 * Se normalizan a un espacio común para que la salida sea estable entre versiones de Node/ICU.
 */
const ICU_SPACES_REGEX = /[\u00A0\u202F]/g;
const normalizeSpaces = (value: string): string => value.replace(ICU_SPACES_REGEX, ' ');

@Injectable()
export class FormatService {
  /**
   * @Descripción: Return number with format
   * @Param _options {FormatNumberOptions}
   * @return: string
   */
  public formatNumber(_options: FormatNumberOptions): string {
    const { num, locale = DEFAULT_LOCALE, formatOptions } = _options;
    return normalizeSpaces(new Intl.NumberFormat(locale, formatOptions).format(num));
  }

  /**
   * @Descripción: Return luxon DateTime instance
   * @return: DateTime
   */
  public dateTimeRef(): typeof DateTime {
    return DateTime;
  }

  /**
   * @Descripción: Return date with format
   * @Param _options {FormatDateOptions}
   * @return: string
   */
  public formatDate(_options: FormatDateOptions): string {
    const {
      date,
      formatDate = DEFAULT_FORMAT_DATE,
      timezone = DEFAULT_TIMEZONE,
      locale = DEFAULT_LOCALE,
    } = _options;
    return normalizeSpaces(
      this.dateTimeRef()
        .fromJSDate(date, { zone: timezone })
        .setLocale(locale)
        .toFormat(formatDate),
    );
  }

  /**
   * @Descripción: Return convert date to ISO
   * @Param _options {ISOFormatDateOptions}
   * @return: string
   */
  public dateToISO(_options: ISOFormatDateOptions): string {
    const { date, timezone = DEFAULT_TIMEZONE } = _options;
    return this.dateTimeRef().fromJSDate(date, { zone: timezone }).toISO();
  }

  /**
   * @Descripción: Return diff between two timestamps
   * @Param _options {CalculateTimestampDiffOptions}
   * @return: string | number
   */
  public calculateTimestampDiff(_options: CalculateTimestampDiffOptions): number | string {
    const { startTime, endTime, options } = _options;
    const diffOptions: Required<TimestampDiffOptions> = {
      unit: options?.unit ?? DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF.unit,
      addSuffix: options?.addSuffix ?? DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF.addSuffix,
    };

    const start = this.dateTimeRef().fromMillis(startTime);
    const end = this.dateTimeRef().fromMillis(endTime);
    const duration = end.diff(start).as(diffOptions.unit);
    return diffOptions.addSuffix ? `${duration}${TimeSuffixes[diffOptions.unit]}` : duration;
  }
}
