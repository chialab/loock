import { type FocusManagerOptions, focusManager } from './focusManager';

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
    /**
     * A function to determine whether the keyboard event should be ignored.
     */
    shouldIgnoreEvent?: (event: KeyboardEvent) => boolean;
}

/**
 * The behavior controller for keyboard navigation.
 */
export interface KeyboardNavigationBehavior {
    connected: boolean;
    connect(): void;
    disconnect(): void;
}

/**
 * Navigate focusable elements with keyboard.
 * @param node The target element.
 * @param options Behavior options.
 * @returns The behavior controller.
 */
export function keyboardNavigationBehavior(
    node: HTMLElement,
    options: KeyboardNavigationOptions
): KeyboardNavigationBehavior {
    let connected = false;

    const manager = focusManager(node, options);
    const shouldIgnoreEvent =
        options.shouldIgnoreEvent ??
        ((event) => {
            const inputTarget = (event.target as HTMLElement)?.closest(
                'input, textarea, select, [contenteditable]'
            );
            return !!inputTarget;
        });

    const onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        if (shouldIgnoreEvent(event)) {
            return;
        }

        const activeElement = manager.getActiveElement();
        const current =
            activeElement && node.contains(activeElement)
                ? activeElement
                : null;

        const {
            prevKeys = ['Up', 'ArrowUp', 'Left', 'ArrowLeft'],
            nextKeys = ['Down', 'ArrowDown', 'Right', 'ArrowRight'],
            firstKeys = ['Home'],
            lastKeys = ['End'],
            continuous = false,
        } = options;
        const elements = manager.findFocusable();
        let index = current ? elements.indexOf(current) : -1;
        if (index === -1) {
            index = elements.findIndex((el) => el.contains(current));
        }
        if (prevKeys.includes(event.key)) {
            // select previous list item
            event.preventDefault();
            if (index === -1) {
                manager.focusLast();
                return;
            }
            const item =
                elements[index - 1] ||
                (continuous ? elements[elements.length - 1] : elements[0]);
            if (item) {
                manager.focusNode(item);
            }
            return;
        }
        if (nextKeys.includes(event.key)) {
            // select next list item
            event.preventDefault();
            if (index === -1) {
                manager.focusFirst();
                return;
            }
            const item =
                elements[index + 1] ||
                (continuous ? elements[0] : elements[elements.length - 1]);
            if (item) {
                manager.focusNode(item);
            }
            return;
        }
        if (firstKeys.includes(event.key)) {
            // select first list item
            event.preventDefault();
            if (index === -1) {
                manager.focusFirst();
                return;
            }
            const item = elements[0];
            if (item) {
                manager.focusNode(item);
            }
            return;
        }
        if (lastKeys.includes(event.key)) {
            // select last list item
            event.preventDefault();
            if (index === -1) {
                manager.focusLast();
                return;
            }
            const item = elements[elements.length - 1];
            if (item) {
                manager.focusNode(item);
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
