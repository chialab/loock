import { defineConfig } from 'vitepress';
import { OramaPlugin } from '@orama/plugin-vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Loock',
    description: 'Refined keyboard navigation for websites and components.',
    base: '/loock/',
    outDir: '../public',

    head: [['link', { rel: 'icon', href: 'https://www.chialab.it/favicon.png' }]],

    vite: {
        plugins: [OramaPlugin()]
    },

    themeConfig: {
        logo: 'https://raw.githubusercontent.com/chialab/loock/main/logo.svg',

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {
                text: 'Home',
                link: '/',
            },
            {
                text: 'Guide',
                link: '/guide/',
            },
            {
                text: 'Chialab.io',
                link: 'https://www.chialab.io',
            },
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    {
                        text: 'Get started',
                        link: '/guide/',
                    },
                    {
                        text: 'focusManager',
                        link: '/guide/focus-manager',
                    },
                    {
                        text: 'focusTrapBehavior',
                        link: '/guide/focus-trap-behavior',
                    },
                    {
                        text: 'focusEnterBehavior',
                        link: '/guide/focus-enter-behavior',
                    },
                    {
                        text: 'focusFirstChildBehavior',
                        link: '/guide/focus-first-child-behavior',
                    },
                    {
                        text: 'keyboardNavigationBehavior',
                        link: '/guide/keyboard-navigation-behavior',
                    },
                ],
            },
            {
                text: 'Demos',
                items: [
                    {
                        text: 'focusTrapBehavior',
                        link: 'https://chialab.github.io/loock/demo/focusTrapBehavior.html',
                    },
                ],
            },
        ],

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/chialab/loock',
            },
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023 - DNA project - Chialab',
        },
    },
    lastUpdated: true,
});
