import { obfuscateValue } from '../redact/providers/redact.provider.js';

describe('obfuscateValue', () => {
  it('should obfuscate from right by default', () => {
    expect(obfuscateValue('123456789', '****')).toBe('12345****');
  });

  it('should obfuscate from left', () => {
    expect(obfuscateValue('123456789', '****', 'left')).toBe('****56789');
  });

  it('should return only the censor for strings shorter than the censor', () => {
    expect(obfuscateValue('ab', '****', 'right')).toBe('****');
    expect(obfuscateValue('ab', '****', 'left')).toBe('****');
  });

  it('should return only the censor for non string values', () => {
    expect(obfuscateValue(123456789, '****')).toBe('****');
    expect(obfuscateValue(true, '****', 'left')).toBe('****');
    expect(obfuscateValue({ a: 1 }, '****')).toBe('****');
    expect(obfuscateValue(['a'], '****')).toBe('****');
  });
});
