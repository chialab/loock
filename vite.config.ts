import UnpluginIsolatedDecl from 'unplugin-isolated-decl/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [UnpluginIsolatedDecl()],
    publicDir: false,
    build: {
        target: 'es2017',
        lib: {
            entry: { loock: 'src/index.ts' },
            formats: ['es'],
        },
        rolldownOptions: {
            output: {
                dir: 'dist',
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                format: 'es',
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
