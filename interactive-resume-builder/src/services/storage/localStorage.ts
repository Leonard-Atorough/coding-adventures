export default class LocalStorage {
  static save(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
  static load<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }
  static remove(key: string): void {
    localStorage.removeItem(key);
  }
  static clear(): void {
    localStorage.clear();
  }
}
