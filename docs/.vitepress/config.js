import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Loock',
    description: 'Keyboard navigation for Web Apps and Components',
    base: '/loock/',
    outDir: '../public',
    appearance: 'force-auto',

    head: [
        ['link', { rel: 'icon', href: '/loock/favicon.png' }],
        ['script', {}, `var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(["setDomains", ["*.chialab.github.io/dna","*.chialab.github.io/loock","*.chialab.github.io/rna"]]);
    _paq.push(["disableCookies"]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
        var u="https://analytics.chialab.io/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '2']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();`]
    ],

    themeConfig: {
        logo: '/chialab.svg',

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
                text: 'Ecosystem',
                items: [
                    { text: 'DNA', link: 'https://chialab.github.io/dna/' },
                    { text: 'RNA', link: 'https://chialab.github.io/rna/' },
                    { text: 'Synapse', link: 'https://chialab.github.io/synapse/' },
                    { text: 'Catalog', link: 'https://catalog.chialab.io/' },
                ],
            },
            {
                text: 'Chialab',
                link: 'https://www.chialab.it',
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
            message: 'Keyboard navigation for Web Apps and Components.',
            copyright: '© 2026 Chia Lab Srl. MIT license.',
        },
    },
    lastUpdated: true,
});
