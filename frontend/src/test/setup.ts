import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:3000',
  host: 'localhost:3000',
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
