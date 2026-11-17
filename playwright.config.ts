import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { channel: 'chromium', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tablet',
      use: { channel: 'chromium', viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Mobile',
      use: { channel: 'chromium', viewport: { width: 375, height: 667 } },
    },
  ],
});
