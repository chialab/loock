/**
 * Default focusable selectors.
 */
export const DEFAULT_SELECTORS = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'video[controls]',
    'audio[controls]',
    'embed',
    'iframe',
    'summary',
    '[contenteditable]',
    '[tabindex]',
];

/**
 * Default ignore selectors.
 */
export const DEFAULT_IGNORE_SELECTORS = [
    '[tabindex="-1"]',
    '[disabled]',
    '[hidden]',
    '[aria-hidden="true"]',
    '[aria-disabled="true"]',
    '[inert]',
    'details:not([open]) *:not(summary)',
];
