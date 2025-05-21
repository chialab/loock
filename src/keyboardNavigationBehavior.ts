import { focusManager, type FocusManagerOptions } from './focusManager';

/**
 * The options for keyboard navigation.
 */
export interface KeyboardNavigationOptions extends FocusManagerOptions {
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
    firstKeys?: string[];
    /**
     * The keys to select the last element.
     */
    lastKeys?: string[];
    /**
     * Whether to navigate continuously.
     */
    continuous?: boolean;
}

/**
 * Navigate focusable elements with keyboard.
 * @param node The target element.
 * @param options Behavior options.
 * @returns The behavior controller.
 */
export function keyboardNavigationBehavior(node: HTMLElement, options: KeyboardNavigationOptions) {
    let connected = false;

    const manager = focusManager(node, options);
    const onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        const current = node.contains(node.ownerDocument.activeElement)
            ? (node.ownerDocument.activeElement as HTMLElement)
            : null;
        if (!current) {
            return;
        }

        const {
            prevKeys = ['Up', 'ArrowUp', 'Left', 'ArrowLeft'],
            nextKeys = ['Down', 'ArrowDown', 'Right', 'ArrowRight'],
            firstKeys = ['Home'],
            lastKeys = ['End'],
            continuous = false,
        } = options;
        const elements = manager.findFocusable();
        const index = elements.findIndex((el) => el === current || el.contains(current));
        if (prevKeys.includes(event.key)) {
            // select previous list item
            event.preventDefault();
            const item = elements[index - 1] || (continuous ? elements[elements.length - 1] : elements[0]);
            if (item) {
                item.focus();
            }
            return;
        }
        if (nextKeys.includes(event.key)) {
            // select next list item
            event.preventDefault();
            const item = elements[index + 1] || (continuous ? elements[0] : elements[elements.length - 1]);
            if (item) {
                item.focus();
            }
            return;
        }
        if (firstKeys.includes(event.key)) {
            // select first list item
            event.preventDefault();
            const item = elements[0];
            if (item) {
                item.focus();
            }
            return;
        }
        if (lastKeys.includes(event.key)) {
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
            node.addEventListener('keydown', onKeydown);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            node.removeEventListener('keydown', onKeydown);
        },
    };
}
