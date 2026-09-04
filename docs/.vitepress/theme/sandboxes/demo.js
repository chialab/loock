/// <reference types="vite/client" />

const sources = await import.meta.glob('./**/*.{js,ts,jsx,tsx,css,html}', {
    eager: true,
    import: 'default',
    query: '?raw',
    base: '../../../../demo/focus-trap',
});

export const files = {
    'index.ts': {
        code: sources['./index.ts'],
    },
    'index.html': {
        code: sources['./index.html'],
    },
};

export const customSetup = {
    entry: 'index.ts',
    dependencies: {
        '@chialab/loock': '^4.5.2',
    },
};
