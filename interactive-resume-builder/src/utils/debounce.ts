export function debounce<T extends (...args: any[]) => void>(func: T, wait: number = 1000): T {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}
