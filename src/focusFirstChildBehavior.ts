import { findFocusableByOptions } from './findFocusableChildren';
import { restoreAttribute } from './helpers';

/**
 * The options for focus first option on focus enter.
 */
export interface FocusFirstChildOptions {
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

/**
 * Focus first option on focus enter.
 * @param node The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusFirstChildBehavior(node: HTMLElement, options: FocusFirstChildOptions = {}) {
    const document = node.ownerDocument;
    let activeElement: HTMLElement | null = null;
    let connected = false;
    let tabindex: string | null = null;

    const onFocus = () => {
        const elements = findFocusableByOptions(node, options);
        const target = document.activeElement as HTMLElement;
        if (target === node) {
            if (activeElement && node.contains(activeElement)) {
                activeElement.focus();
                return;
            }

            elements[0]?.focus();
            return;
        } else if (elements.includes(target)) {
            activeElement = target;
        }
    };

    return {
        get connected() {
            return connected;
        },
        connect() {
            if (connected) {
                return;
            }
            connected = true;
            activeElement = null;
            tabindex = node.getAttribute('tabindex');
            node.setAttribute('tabindex', '-1');
            node.addEventListener('focus', onFocus, true);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            activeElement = null;
            restoreAttribute(node, 'tabindex', tabindex);
            node.removeEventListener('focus', onFocus, true);
        },
    };
}
