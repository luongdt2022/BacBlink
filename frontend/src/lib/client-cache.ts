/**
 * Lightweight browser-only TTL & in-flight deduplication cache for read queries.
 * Prevents redundant network round-trips when navigating back and forth between screens.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const valueCache = new Map<string, CacheEntry<unknown>>();
const inFlightCache = new Map<string, Promise<unknown>>();
const keyGeneration = new Map<string, number>();

function bumpKeyGeneration(key: string): void {
  keyGeneration.set(key, (keyGeneration.get(key) ?? 0) + 1);
}

export function invalidateCache(key: string): void {
  bumpKeyGeneration(key);
  valueCache.delete(key);
  inFlightCache.delete(key);
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of Array.from(valueCache.keys())) {
    if (key.startsWith(prefix)) {
      bumpKeyGeneration(key);
      valueCache.delete(key);
    }
  }
  for (const key of Array.from(inFlightCache.keys())) {
    if (key.startsWith(prefix)) {
      bumpKeyGeneration(key);
      inFlightCache.delete(key);
    }
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  forceRefresh = false
): Promise<T> {
  if (typeof window === "undefined" || ttlMs <= 0) {
    return fetcher();
  }

  if (forceRefresh) {
    invalidateCache(key);
  }

  const hit = valueCache.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return hit.data as T;
  }

  const pending = inFlightCache.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const gen = keyGeneration.get(key) ?? 0;
  const promise = fetcher()
    .then((data) => {
      if ((keyGeneration.get(key) ?? 0) === gen) {
        valueCache.set(key, {
          data,
          expiresAt: Date.now() + ttlMs,
        });
      }
      return data;
    })
    .finally(() => {
      if (inFlightCache.get(key) === promise) {
        inFlightCache.delete(key);
      }
    });

  inFlightCache.set(key, promise);
  return promise;
}
