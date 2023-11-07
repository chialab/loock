import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: './src',
    build: {
        outDir: './public',
    },
    server: {
        port: 5173,
    },
    preview: {
        port: 8765,
    },
});
