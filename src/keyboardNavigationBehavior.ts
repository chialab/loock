import { findFocusableChildren } from './findFocusableChildren';

/**
 * The options for keyboard navigation.
 */
export interface KeyboardNavigationOptions {
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
    /**
     * The keys to select the previous element.
     */
    prevKeys?: string[];
    /**
     * The keys to select the next element.
     */
    nextKeys?: string[];
    /**
     * The keys to select the first element.
     */
    homeKeys?: string[];
    /**
     * The keys to select the last element.
     */
    endKeys?: string[];
}

/**
 * Navigate focusable elements with keyboard.
 * @param element The target element.
 * @param options Behavior options.
 * @returns The behavior controller.
 */
export function keyboardNavigationBehavior(element: HTMLElement, options: KeyboardNavigationOptions) {
    const document = element.ownerDocument;
    let connected = false;

    const onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        const current = element.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
        if (!current) {
            return;
        }

        const {
            prevKeys = ['Up', 'ArrowUp', 'Left', 'ArrowLeft'],
            nextKeys = ['Down', 'ArrowDown', 'Right', 'ArrowRight'],
            homeKeys = ['Home'],
            endKeys = ['End'],
            include,
            exclude,
            elements = findFocusableChildren(element, include, exclude),
        } = options;
        const index = elements.findIndex((el) => el === current || el.contains(current));
        if (prevKeys.includes(event.key)) {
            // select previous list item
            event.preventDefault();
            const item = elements[index - 1] || elements[0];
            if (item) {
                item.focus();
            }
            return;
        }
        if (nextKeys.includes(event.key)) {
            // select next list item
            event.preventDefault();
            const item = elements[index + 1] || elements[elements.length - 1];
            if (item) {
                item.focus();
            }
            return;
        }
        if (homeKeys.includes(event.key)) {
            // select first list item
            event.preventDefault();
            const item = elements[0];
            if (item) {
                item.focus();
            }
            return;
        }
        if (endKeys.includes(event.key)) {
            // select last list item
            event.preventDefault();
            const item = elements[elements.length - 1];
            if (item) {
                item.focus();
            }
            return;
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
            element.addEventListener('keydown', onKeydown);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            element.removeEventListener('keydown', onKeydown);
        },
    };
}
