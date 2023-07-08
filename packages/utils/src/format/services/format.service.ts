import { Injectable } from '@nestjs/common';
import { DEFAULT_LOCALE } from '../constants/format.constant';
import { FormatNumberOptions } from '../interfaces/format.interface';

@Injectable()
export class FormatService {
  formatNumber(options: FormatNumberOptions): string {
    const { num, locale = DEFAULT_LOCALE, formatOptions } = options;
    return new Intl.NumberFormat(locale, formatOptions).format(num).replace(/\u00A0/g, ' ');
  }
}
