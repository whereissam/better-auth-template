/**
 * API Configuration
 *
 * Centralizes all API URLs and endpoints
 */

// Backend API URL (direct connection for non-auth requests)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

// Frontend URL for auth callbacks (must go through proxy)
export const APP_URL = import.meta.env.VITE_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// API endpoints
export const API_ENDPOINTS = {
  // SIWE endpoints
  siwe: {
    sign: `${API_URL}/api/siwe/sign`,
    verify: `${API_URL}/api/siwe/verify`,
  },
  // Better Auth endpoints (accessed via proxy)
  auth: `${APP_URL}/api/auth`,
  // Health check
  health: `${API_URL}/health`,
} as const;
