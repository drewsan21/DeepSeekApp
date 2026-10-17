/**
 * Cache for Intl formatters — constructing an Intl instance is expensive,
 * so we create each formatter once and reuse it across all calls.
 */
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormatter.format(d);
}

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Static regex literals are compiled once at module load instead of being
// re-created on every call.
const SLUG_NON_ALNUM = /[^a-z0-9]+/g;
const SLUG_EDGES = /^-+|-+$/g;

/**
 * Convert a string to slug format (lowercase, hyphens)
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(SLUG_NON_ALNUM, '-')
    .replace(SLUG_EDGES, '');
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Pre-computed at module load so hot paths don't repeat the work.
const LOG_BASE_1024 = Math.log(1024);
const BYTE_UNITS = Object.freeze(['B', 'KB', 'MB', 'GB', 'TB']);
const UNIT_FACTORS: readonly number[] = BYTE_UNITS.map((_, i) => Math.pow(1024, i));

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  // Clamp the index so very large values still produce a sensible unit
  // and out-of-range lookups are impossible.
  const i = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / LOG_BASE_1024),
    UNIT_FACTORS.length - 1
  );

  return `${parseFloat((bytes / UNIT_FACTORS[i]).toFixed(2))} ${BYTE_UNITS[i]}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel(): void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };

  // Allow callers (e.g. effect cleanups) to cancel a pending invocation
  // and release the timer reference.
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Deep clone an object.
 * Uses the native structuredClone when available (faster and handles Dates,
 * Maps, Sets, typed arrays and circular references), falling back to the
 * JSON round-trip in older runtimes.
 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch {
      // Value contains something structuredClone can't copy (e.g. functions)
      // — fall through to the JSON strategy.
    }
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
