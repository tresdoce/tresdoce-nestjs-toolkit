import { Test, TestingModule } from '@nestjs/testing';
import { FormatService } from '../format/services/format.service';

describe('FormatService', () => {
  let service: FormatService;

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
    expect(service.formatNumber({ num: 0.123456, formatOptions, locale: 'en-US' })).toBe('12.35%');
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
