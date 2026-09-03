import { fileURLToPath } from 'node:url';
import UnpluginIsolatedDecl from 'unplugin-isolated-decl/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [UnpluginIsolatedDecl()],
    publicDir: false,
    resolve: {
        alias: {
            '@chialab/loock': fileURLToPath(
                new URL('./src/index.ts', import.meta.url)
            ),
        },
    },
    build: {
        outDir: 'dist',
        lib: {
            entry: { loock: 'src/index.ts' },
            formats: ['es'],
        },
        rolldownOptions: {
            output: {
                entryFileNames: '[name].js',
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
