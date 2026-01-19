// Simple in-memory cache for API responses
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new Cache();
