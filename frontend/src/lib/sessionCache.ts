/**
 * Session Cache
 *
 * Caches the user session in memory to reduce API calls.
 * Cache is cleared on logout or after expiration.
 */

interface CachedSession {
  data: any;
  timestamp: number;
}

let sessionCache: CachedSession | null = null;
const CACHE_DURATION = 60000; // 60 seconds

export const getCachedSession = () => {
  if (!sessionCache) return null;

  const now = Date.now();
  const isExpired = (now - sessionCache.timestamp) > CACHE_DURATION;

  if (isExpired) {
    sessionCache = null;
    return null;
  }

  return sessionCache.data;
};

export const setCachedSession = (session: any) => {
  sessionCache = {
    data: session,
    timestamp: Date.now(),
  };
};

export const clearSessionCache = () => {
  sessionCache = null;
};
