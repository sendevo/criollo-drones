import { describe, expect, it } from 'vitest';
import { parseNumericValue, parseNonNegativeNumber, formatNumericValue } from '../../src/utils/index.js';

describe('numeric parsing helpers', () => {
  it('parses decimal commas and thousands separators', () => {
    expect(parseNumericValue('1.234,56')).toBe(1234.56);
    expect(parseNumericValue('12,5')).toBe(12.5);
    expect(parseNumericValue('1.234')).toBe(1234);
  });

  it('keeps values non-negative', () => {
    expect(parseNonNegativeNumber('-12,5')).toBe(12.5);
    expect(parseNonNegativeNumber('')).toBe('');
  });

  it('formats numbers with Spanish separators', () => {
    expect(formatNumericValue(1234.56)).toBe('1.234,56');
    expect(formatNumericValue('12.5')).toBe('12,5');
  });
});
