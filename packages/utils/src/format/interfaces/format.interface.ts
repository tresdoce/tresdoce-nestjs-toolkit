export enum TimeSuffixes {
  'milliseconds' = 'ms',
  'seconds' = 's',
  'minutes' = 'min',
  'hours' = 'h',
  'days' = 'd',
  'weeks' = 'w',
  'months' = 'mo',
  'years' = 'y',
}

export type TimeUnit = keyof typeof TimeSuffixes;

export interface FormatNumberOptions {
  num: number;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export interface FormatDateOptions {
  date: Date;
  formatDate?: string;
  timezone?: string;
  locale?: string;
}

export interface ISOFormatDateOptions {
  date: Date;
  timezone?: string;
}

export interface TimestampDiffOptions {
  addSuffix?: boolean;
  unit?: TimeUnit;
}

export interface CalculateTimestampDiffOptions {
  startTime: number;
  endTime: number;
  options?: TimestampDiffOptions;
}
