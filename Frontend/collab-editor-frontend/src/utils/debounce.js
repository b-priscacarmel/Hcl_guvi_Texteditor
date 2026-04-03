/**
 * Returns a debounced version of fn that delays invoking
 * until after `delay` ms have elapsed since the last call.
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Throttle: invoke fn at most once per `limit` ms.
 */
export function throttle(fn, limit = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}
