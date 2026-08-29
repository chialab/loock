import UnpluginIsolatedDecl from 'unplugin-isolated-decl/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [UnpluginIsolatedDecl()],
    publicDir: false,
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
