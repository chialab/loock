import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'test',
    use: {
        baseURL: 'http://localhost:8765',
    },
    webServer: {
        command: 'yarn vite build && yarn vite preview',
        url: 'http://localhost:8765',
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
