import {
  formatDate,
  formatRelativeTime,
  truncate,
  capitalize,
  toSlug,
  percentage,
  formatBytes,
  debounce,
  deepClone,
  isEmpty,
} from '../utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    test('formats Date object correctly', () => {
      const date = new Date('2024-03-18');
      const result = formatDate(date);
      expect(result).toMatch(/Mar 18, 2024/);
    });

    test('formats string date correctly', () => {
      const result = formatDate('2024-03-18');
      expect(result).toMatch(/Mar 18, 2024/);
    });

    test('formats timestamp correctly', () => {
      const timestamp = new Date('2024-03-18').getTime();
      const result = formatDate(timestamp);
      expect(result).toMatch(/Mar 18, 2024/);
    });
  });

  describe('formatRelativeTime', () => {
    test('returns "just now" for recent timestamps', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    test('returns minutes ago', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    test('returns hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    test('returns days ago', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    test('handles singular forms', () => {
      const oneMinuteAgo = Date.now() - 60 * 1000;
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });
  });

  describe('truncate', () => {
    test('returns original string if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    test('truncates long strings with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    test('handles exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    test('handles empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    test('handles already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('toSlug', () => {
    test('converts to lowercase', () => {
      expect(toSlug('Hello World')).toBe('hello-world');
    });

    test('replaces spaces with hyphens', () => {
      expect(toSlug('hello world')).toBe('hello-world');
    });

    test('removes special characters', () => {
      expect(toSlug('Hello! World?')).toBe('hello-world');
    });

    test('removes leading/trailing hyphens', () => {
      expect(toSlug('  hello  ')).toBe('hello');
    });

    test('handles multiple spaces', () => {
      expect(toSlug('hello   world')).toBe('hello-world');
    });
  });

  describe('percentage', () => {
    test('calculates percentage correctly', () => {
      expect(percentage(50, 100)).toBe(50);
    });

    test('handles zero total', () => {
      expect(percentage(50, 0)).toBe(0);
    });

    test('rounds to nearest integer', () => {
      expect(percentage(1, 3)).toBe(33);
    });

    test('handles 100%', () => {
      expect(percentage(100, 100)).toBe(100);
    });
  });

  describe('formatBytes', () => {
    test('formats bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    test('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    test('formats megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });

    test('formats gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('handles decimal values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('delays function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('resets timer on subsequent calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);
      
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('passes arguments to original function', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('deepClone', () => {
    test('clones simple objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    test('clones nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
    });

    test('clones arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    test('handles null and undefined', () => {
      expect(deepClone(null)).toBeNull();
      expect(deepClone(undefined)).toBeUndefined();
    });
  });

  describe('isEmpty', () => {
    test('returns true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    test('returns true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    test('returns true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    test('returns true for whitespace string', () => {
      expect(isEmpty('   ')).toBe(true);
    });

    test('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    test('returns true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    test('returns false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    test('returns false for non-empty array', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    test('returns false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    test('returns false for numbers', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(42)).toBe(false);
    });

    test('returns false for booleans', () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });
});
