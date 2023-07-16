import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import {
  DEFAULT_FORMAT_DATE,
  DEFAULT_LOCALE,
  DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF,
  DEFAULT_TIMEZONE,
} from '../constants/format.constant';
import {
  CalculateTimestampDiffOptions,
  FormatDateOptions,
  FormatNumberOptions,
  ISOFormatDateOptions,
  TimeSuffixes,
} from '../interfaces/format.interface';

@Injectable()
export class FormatService {
  /**
   * @Descripción: Return number with format
   * @Param options {FormatNumberOptions}
   * @return: string
   */
  public formatNumber(_options: FormatNumberOptions): string {
    const { num, locale = DEFAULT_LOCALE, formatOptions } = _options;
    return new Intl.NumberFormat(locale, formatOptions).format(num).replace(/\u00A0/g, ' ');
  }

  /**
   * @Descripción: Return luxon DateTime instance
   * @return: DateTime
   */
  public dateTimeRef() {
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
    const diffOptions = { ...DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF, ...options };

    const start = this.dateTimeRef().fromMillis(startTime);
    const end = this.dateTimeRef().fromMillis(endTime);
    const duration = end.diff(start).as(diffOptions.unit as any);
    return diffOptions.addSuffix ? `${duration}${TimeSuffixes[diffOptions.unit]}` : duration;
  }
}
