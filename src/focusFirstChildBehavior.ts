import { findFocusableChildren } from './findFocusableChildren';

/**
 * The options for focus first option on focus enter.
 */
export interface FocusFirstChildOptions {
    /**
     * The focusable elements.
     */
    elements?: HTMLElement[];
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
 * @param element The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusFirstChildBehavior(element: HTMLElement, options: FocusFirstChildOptions = {}) {
    const document = element.ownerDocument;
    let activeElement: HTMLElement | null = null;
    let connected = false;

    const onFocus = () => {
        const { include, exclude, elements = findFocusableChildren(element, include, exclude) } = options;
        const target = document.activeElement as HTMLElement;
        if (target === element) {
            if (activeElement && element.contains(activeElement)) {
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
            element.addEventListener('focus', onFocus, true);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            activeElement = null;
            element.removeEventListener('focus', onFocus, true);
        },
    };
}
