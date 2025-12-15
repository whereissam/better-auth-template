import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCachedSession, setCachedSession, clearSessionCache } from './sessionCache';

describe('sessionCache', () => {
  beforeEach(() => {
    clearSessionCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setCachedSession', () => {
    it('should store session data', () => {
      const mockSession = {
        data: {
          user: { id: '123', name: 'Test User', email: 'test@example.com' },
          session: { id: 'session-123' },
        },
      };

      setCachedSession(mockSession);
      const cached = getCachedSession();

      expect(cached).toEqual(mockSession);
    });

    it('should cache any value including null', () => {
      // The implementation caches whatever is passed
      setCachedSession(null);
      expect(getCachedSession()).toBeNull();
    });
  });

  describe('getCachedSession', () => {
    it('should return null when cache is empty', () => {
      expect(getCachedSession()).toBeNull();
    });

    it('should return cached session within TTL (60 seconds)', () => {
      const mockSession = {
        data: {
          user: { id: '123', name: 'Test User' },
        },
      };

      setCachedSession(mockSession);

      // Advance time but stay within TTL (60 seconds)
      vi.advanceTimersByTime(30 * 1000); // 30 seconds

      expect(getCachedSession()).toEqual(mockSession);
    });

    it('should return null when cache expires (after 60 seconds)', () => {
      const mockSession = {
        data: {
          user: { id: '123', name: 'Test User' },
        },
      };

      setCachedSession(mockSession);

      // Advance time past TTL (60 seconds)
      vi.advanceTimersByTime(61 * 1000); // 61 seconds

      expect(getCachedSession()).toBeNull();
    });

    it('should return session at exactly 60 seconds', () => {
      const mockSession = {
        data: {
          user: { id: '123', name: 'Test User' },
        },
      };

      setCachedSession(mockSession);
      vi.advanceTimersByTime(60 * 1000); // Exactly 60 seconds

      expect(getCachedSession()).toEqual(mockSession);
    });
  });

  describe('clearSessionCache', () => {
    it('should clear the cached session', () => {
      const mockSession = {
        data: {
          user: { id: '123', name: 'Test User' },
        },
      };

      setCachedSession(mockSession);
      expect(getCachedSession()).toEqual(mockSession);

      clearSessionCache();
      expect(getCachedSession()).toBeNull();
    });
  });
});
