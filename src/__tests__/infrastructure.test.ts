/**
 * Basic smoke test to verify test infrastructure works
 */

describe('Test Infrastructure', () => {
  test('jest is working', () => {
    expect(true).toBe(true);
  });

  test('basic assertions work', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toHaveLength(5);
    expect([1, 2, 3]).toContain(2);
  });

  test('object matching works', () => {
    const obj = { a: 1, b: 2 };
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(obj).toHaveProperty('a');
    expect(obj).toHaveProperty('b', 2);
  });

  test('array matching works', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
    expect(arr).toEqual(expect.arrayContaining([1, 2]));
  });

  test('string matching works', () => {
    const str = 'hello world';
    expect(str).toMatch(/hello/);
    expect(str).toContain('world');
    expect(str).toHaveLength(11);
  });

  test('async/await works', async () => {
    const promise = Promise.resolve(42);
    const result = await promise;
    expect(result).toBe(42);
  });

  test('mock functions work', () => {
    const mockFn = jest.fn();
    mockFn('arg1', 'arg2');
    
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('timers work', () => {
    jest.useFakeTimers();
    
    const callback = jest.fn();
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
});
