import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'test',
    use: {
        baseURL: 'http://localhost:5173',
    },
    webServer: {
        command: 'yarn vite',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
});
