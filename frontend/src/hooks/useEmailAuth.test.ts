import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmailAuth } from './useEmailAuth';

// Mock the auth client
vi.mock('@/lib/auth.client', () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
    signIn: {
      email: vi.fn(),
    },
    forgetPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

import { authClient } from '@/lib/auth.client';

describe('useEmailAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(response.success).toBe(true);
      expect(response.requiresVerification).toBe(true);
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    it('should handle signup error', async () => {
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: null,
        error: { message: 'Email already exists', status: 400 },
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });

    it('should handle network error', async () => {
      vi.mocked(authClient.signUp.email).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should set loading state during signup', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(authClient.signUp.email).mockReturnValue(promise as any);

      const { result } = renderHook(() => useEmailAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ data: { user: {} }, error: null });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(authClient.signIn.email).mockResolvedValue({
        data: { user: mockUser, session: { id: 'session-123' } },
        error: null,
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'password123');
      });

      expect(response.success).toBe(true);
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('should handle unverified email error (403)', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({
        data: null,
        error: { message: 'Email not verified', status: 403 },
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'password123');
      });

      expect(response.success).toBe(false);
      expect(response.needsVerification).toBe(true);
      expect(result.current.error).toContain('verify your email');
    });

    it('should handle invalid credentials', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials', status: 401 },
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'wrongpassword');
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should pass rememberMe option', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({
        data: { user: {}, session: {} },
        error: null,
      });

      const { result } = renderHook(() => useEmailAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123', false);
      });

      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      vi.mocked(authClient.forgetPassword).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.requestPasswordReset('test@example.com');
      });

      expect(response.success).toBe(true);
      expect(authClient.forgetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        redirectTo: 'http://localhost:3000/reset-password',
      });
    });

    it('should handle error when email not found', async () => {
      vi.mocked(authClient.forgetPassword).mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.requestPasswordReset('nonexistent@example.com');
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      vi.mocked(authClient.resetPassword).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('newPassword123', 'valid-token');
      });

      expect(response.success).toBe(true);
      expect(authClient.resetPassword).toHaveBeenCalledWith({
        newPassword: 'newPassword123',
        token: 'valid-token',
      });
    });

    it('should handle invalid token error', async () => {
      vi.mocked(authClient.resetPassword).mockResolvedValue({
        data: null,
        error: { message: 'Invalid or expired token' },
      });

      const { result } = renderHook(() => useEmailAuth());

      let response: any;
      await act(async () => {
        response = await result.current.resetPassword('newPassword123', 'invalid-token');
      });

      expect(response.success).toBe(false);
      expect(result.current.error).toBe('Invalid or expired token');
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      vi.mocked(authClient.signIn.email).mockResolvedValue({
        data: null,
        error: { message: 'Some error', status: 400 },
      });

      const { result } = renderHook(() => useEmailAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
