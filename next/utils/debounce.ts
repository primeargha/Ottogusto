export const debouncedSearch = (() => {
  const timers = new Map<string, NodeJS.Timeout>();

  return (key: string, searchFn: () => Promise<unknown>, delay: number = 500) => {
    return new Promise((resolve, reject) => {
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
      }

      const timeoutId = setTimeout(async () => {
        try {
          const result = await searchFn();
          timers.delete(key);
          resolve(result);
        } catch (error) {
          timers.delete(key);
          reject(error); // Propagate the error
        }
      }, delay);

      timers.set(key, timeoutId as unknown as NodeJS.Timeout);
    });
  };
})();

// For Min max price
type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 500,
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | number;

  const debouncedFn = (...args: Parameters<T>) => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        try {
          const result = fn(...args);
          resolve(result as ReturnType<T>);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return debouncedFn;
}
