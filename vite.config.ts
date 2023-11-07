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
    esbuild: {
        include: /\.(m?(t|j)s|[jt]sx)$/,
        target: ['es2020'],
        platform: 'browser',
    },
    resolve: {
        alias: {
            '@chialab/loock': './src/index.js',
        },
    },
});
