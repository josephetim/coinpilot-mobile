import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatQuantity,
} from '@/utils/format';

describe('format helpers', () => {
  it('formats regular USD values', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats tiny USD values with higher precision', () => {
    expect(formatCurrency(0.00012345)).toBe('$0.00012345');
  });

  it('formats compact currency values', () => {
    expect(formatCompactCurrency(1250000)).toBe('$1.3M');
  });

  it('formats percentages with explicit sign', () => {
    expect(formatPercent(12.345)).toBe('+12.35%');
    expect(formatPercent(-5.2)).toBe('-5.20%');
  });

  it('formats quantities and handles nullish values', () => {
    expect(formatQuantity(1.234567)).toBe('1.23');
    expect(formatCurrency(null)).toBe('N/A');
  });
});
