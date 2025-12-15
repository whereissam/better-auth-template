import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}', 'lib/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    setupFiles: ['./test/setup.ts'],
  },
});
