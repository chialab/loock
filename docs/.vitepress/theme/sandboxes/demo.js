/// <reference types="vite/client" />

const sources = await import.meta.glob('./**/*.{js,ts,jsx,tsx,css,html}', {
    eager: true,
    import: 'default',
    query: '?raw',
    base: '../../../../demo/focus-trap',
});

export const files = {
    ...Object.entries(sources).reduce((acc, [path, code]) => {
        acc[path.replace('./', '')] = { code };
        return acc;
    }, {}),
};

export const customSetup = {
    entry: 'index.ts',
    dependencies: {
        '@chialab/loock': '^4.5.2',
    },
};
