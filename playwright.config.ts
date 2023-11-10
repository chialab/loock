import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'test',
    use: {
        baseURL: 'http://localhost:5175',
    },
    webServer: {
        command: 'yarn dev',
        url: 'http://localhost:5175',
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
