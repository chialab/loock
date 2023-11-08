import { findFocusableByOptions } from './findFocusableChildren';

export interface FocusManagerOptions {
    /**
     * The focusable elements.
     */
    elements?: HTMLElement[] | (() => HTMLElement[]);
    /**
     * The selectors for focusable nodes.
     */
    include?: string[];
    /**
     * The selectors for ignored nodes.
     */
    exclude?: string[];
}

export function focusManager(node: HTMLElement, options: FocusManagerOptions = {}) {
    return {
        findFocusable() {
            return findFocusableByOptions(node, options);
        },

        /**
         * Focus the first focusable child.
         */
        focusFirst() {
            this.findFocusable().shift()?.focus();
        },

        /**
         * Focus the last focusable child.
         */
        focusLast() {
            this.findFocusable().pop()?.focus();
        },
    };
}
