import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Store mock send function for assertions
const mockSend = vi.fn().mockResolvedValue({ id: 'test-email-id' });

// Mock Resend before importing email module
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe('Email Service', () => {
  let sendEmail: typeof import('./email').sendEmail;
  let sendOTP: typeof import('./email').sendOTP;
  let sendMagicLinkEmail: typeof import('./email').sendMagicLinkEmail;

  beforeEach(async () => {
    vi.resetModules();
    mockSend.mockClear();

    // Set environment
    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.RESEND_FROM_EMAIL = 'test@example.com';

    // Re-import after mocking
    const emailModule = await import('./email');
    sendEmail = emailModule.sendEmail;
    sendOTP = emailModule.sendOTP;
    sendMagicLinkEmail = emailModule.sendMagicLinkEmail;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email with correct parameters', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test body</p>',
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test body</p>',
      });
    });

    it('should use default from email when not configured', async () => {
      vi.resetModules();
      mockSend.mockClear();
      delete process.env.RESEND_FROM_EMAIL;
      process.env.RESEND_API_KEY = 'test-api-key';

      const emailModule = await import('./email');

      await emailModule.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'onboarding@resend.dev',
        })
      );
    });
  });

  describe('sendOTP', () => {
    it('should send sign-in OTP with correct subject', async () => {
      await sendOTP({
        email: 'user@example.com',
        otp: '123456',
        type: 'sign-in',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Your sign-in code',
        })
      );
    });

    it('should send email-verification OTP with correct subject', async () => {
      await sendOTP({
        email: 'user@example.com',
        otp: '654321',
        type: 'email-verification',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Verify your email address',
        })
      );
    });

    it('should send forget-password OTP with correct subject', async () => {
      await sendOTP({
        email: 'user@example.com',
        otp: '111222',
        type: 'forget-password',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Reset your password',
        })
      );
    });

    it('should include OTP in email body', async () => {
      await sendOTP({
        email: 'user@example.com',
        otp: '987654',
        type: 'sign-in',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('987654'),
          html: expect.stringContaining('987654'),
        })
      );
    });
  });

  describe('sendMagicLinkEmail', () => {
    it('should send magic link email with correct parameters', async () => {
      await sendMagicLinkEmail({
        email: 'user@example.com',
        url: 'https://example.com/auth/magic?token=abc123',
        token: 'abc123',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Sign in to your account',
        })
      );
    });

    it('should include magic link URL in email body', async () => {
      const testUrl = 'https://example.com/auth/magic?token=xyz789';

      await sendMagicLinkEmail({
        email: 'user@example.com',
        url: testUrl,
        token: 'xyz789',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(testUrl),
          html: expect.stringContaining(testUrl),
        })
      );
    });
  });
});
