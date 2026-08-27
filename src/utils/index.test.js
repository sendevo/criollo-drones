import { describe, expect, it } from 'vitest';
import { parseNumericValue, formatNumericValue } from './index.js';

describe('numeric parsing helpers', () => {
  it('accepts locale decimal commas and strips negatives', () => {
    expect(parseNumericValue('1.234,56')).toBe(1234.56);
    expect(parseNumericValue('-12,5')).toBe(12.5);
    expect(parseNumericValue('0,75')).toBe(0.75);
  });

  it('formats numeric values using thousands dots and decimal commas', () => {
    expect(formatNumericValue(1234.56)).toBe('1.234,56');
    expect(formatNumericValue('12.5')).toBe('12,5');
  });
});
