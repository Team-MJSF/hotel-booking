import { cn, formatPrice, formatDate } from './utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('correctly processes various className inputs', () => {
      // Test basic string merging
      expect(cn('class1', 'class2')).toBe('class1 class2');
      
      // Test conditional class names
      const isActive = true;
      const isDisabled = false;
      expect(cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      )).toBe('base-class active-class');
      
      // Test array input
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
      
      // Test object input
      expect(cn({ 'conditional-class': true, 'disabled-class': false })).toBe('conditional-class');
      
      // Test null and undefined values
      expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2');
    });
  });

  describe('formatPrice', () => {
    it('correctly formats prices in various scenarios', () => {
      // Basic price formatting
      expect(formatPrice(1000)).toBe('$10');
      expect(formatPrice(15000)).toBe('$150');
      
      // Handle zero
      expect(formatPrice(0)).toBe('$0');
      
      // Rounding behavior
      expect(formatPrice(1050)).toBe('$11'); // Round up
      expect(formatPrice(1049)).toBe('$10'); // Round down
      
      // Large numbers with commas
      expect(formatPrice(1000000)).toBe('$10,000');
      
      // Negative values
      expect(formatPrice(-1000)).toBe('-$10');
    });
  });

  describe('formatDate', () => {
    it('correctly formats dates in various scenarios', () => {
      // Standard date formatting
      const date = new Date('2023-05-15T12:00:00Z');
      expect(formatDate(date)).toBe('Mon, May 15, 2023');
      
      // Different dates
      expect(formatDate(new Date('2022-01-01T12:00:00Z'))).toBe('Sat, Jan 1, 2022');
      expect(formatDate(new Date('2024-12-31T12:00:00Z'))).toBe('Tue, Dec 31, 2024');
      
      // Invalid dates
      expect(formatDate(new Date('invalid-date'))).toBe('Invalid date');
      
      // Timezone consistency
      const localDate = new Date(2023, 4, 15); // May 15, 2023
      expect(formatDate(localDate)).toMatch(/May 15, 2023/);
    });
  });
}); 