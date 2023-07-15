import { Test, TestingModule } from '@nestjs/testing';
import { FormatService } from '../format/services/format.service';
import { DEFAULT_TIMEZONE_LOCALE } from '../format/constants/format.constant';

describe('FormatService', () => {
  let service: FormatService;

  describe('formatNumber', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [FormatService],
      }).compile();

      service = module.get<FormatService>(FormatService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should format a number correctly with no options and no locale', () => {
      expect(service.formatNumber({ num: 123456.789 })).toBe('123.456,789');
    });

    it('should format a number correctly with no options', () => {
      expect(service.formatNumber({ num: 123456.789, locale: 'en-US' })).toBe('123,456.789');
    });

    it('should format a number correctly with ars currency options', () => {
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'ARS',
      };
      expect(service.formatNumber({ num: 123456.789, formatOptions })).toBe('$ 123.456,79');
    });

    it('should format a number correctly with currency options', () => {
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'EUR',
      };
      expect(service.formatNumber({ num: 123456.789, formatOptions, locale: 'es-ES' })).toBe(
        '123.456,79 €',
      );
    });

    it('should format a number correctly with percent options', () => {
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'percent',
        minimumFractionDigits: 2,
      };
      expect(service.formatNumber({ num: 0.123456, formatOptions, locale: 'en-US' })).toBe(
        '12.35%',
      );
    });

    it('should format a number correctly with km units options', () => {
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'unit',
        unit: 'kilometer-per-hour',
      };
      expect(service.formatNumber({ num: 50, formatOptions })).toBe('50 km/h');
    });

    it('should format a number correctly with litres units options', () => {
      const formatOptions: Intl.NumberFormatOptions = {
        style: 'unit',
        unit: 'liter',
        unitDisplay: 'long',
      };
      expect(service.formatNumber({ num: 16, formatOptions })).toBe('16 litros');
    });
  });

  describe('formatDate', () => {
    const mockDate = '2022-12-20T14:37:17.020Z';
    const mockTimeStamp = 1689163589957;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [FormatService],
      }).compile();

      service = module.get<FormatService>(FormatService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should format date with ref of DateTime', () => {
      const isoDate = service.dateTimeRef().now().toISO();
      expect(isoDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|[+-]\d{2}:\d{2})$/);
    });

    it('should format date correctly with default configs', () => {
      const date = new Date(mockDate);
      expect(service.formatDate({ date })).toBe('20/12/2022 14:37:17.020');
    });

    it('should format date correctly with only timezone', () => {
      const date = new Date(mockDate);
      expect(service.formatDate({ date, timezone: 'Europe/Paris' })).toBe(
        '20/12/2022 15:37:17.020',
      );
    });

    it('should format date correctly with only format date', () => {
      const date = new Date(mockDate);
      expect(service.formatDate({ date, formatDate: 'fff' })).toBe(
        '20 de diciembre de 2022 14:37 UTC',
      );
    });

    it('should format date correctly with format date and timezone', () => {
      const date = new Date(mockDate);
      expect(service.formatDate({ date, formatDate: 'fff', timezone: 'Europe/Paris' })).toBe(
        '20 de diciembre de 2022 15:37 GMT+1',
      );
    });

    it('should format date correctly with format date, timezone and locale', () => {
      const date = new Date(mockDate);
      expect(
        service.formatDate({ date, formatDate: 'fff', timezone: 'Europe/Paris', locale: 'fr' }),
      ).toBe('20 décembre 2022, 15:37 UTC+1');
    });

    it('should format date correctly to ISO with default configs', () => {
      const date = new Date(mockTimeStamp);
      expect(service.dateToISO({ date })).toBe('2023-07-12T12:06:29.957Z');
    });

    it('should format date correctly to ISO with only timezone', () => {
      const date = new Date(mockTimeStamp);
      expect(service.dateToISO({ date, timezone: DEFAULT_TIMEZONE_LOCALE })).toBe(
        '2023-07-12T09:06:29.957-03:00',
      );
    });

    it('should calculate diff between two timestamps in milliseconds', () => {
      expect(
        service.calculateTimestampDiff({ startTime: 1689208308510, endTime: 1689208308525 }),
      ).toBe(15);
    });

    it('should calculate diff between two timestamps in milliseconds with suffix', () => {
      expect(
        service.calculateTimestampDiff({
          startTime: 1689208308510,
          endTime: 1689208308525,
          options: { addSuffix: true },
        }),
      ).toBe('15ms');
    });

    it('should calculate diff between two timestamps in seconds', () => {
      expect(
        service.calculateTimestampDiff({
          startTime: 1689208308510,
          endTime: 1689208308525,
          options: { unit: 'seconds' },
        }),
      ).toBe(0.015);
    });

    it('should calculate diff between two timestamps in seconds with suffix', () => {
      expect(
        service.calculateTimestampDiff({
          startTime: 1689208308510,
          endTime: 1689208308525,
          options: { unit: 'seconds', addSuffix: true },
        }),
      ).toBe('0.015s');
    });
  });
});
