import { type FocusManagerOptions, focusManager } from './focusManager';

/**
 * The options for typeahead navigation.
 */
export interface TypeAheadOptions extends FocusManagerOptions {
    /**
     * The delay before clearing the search buffer.
     */
    timeout?: number;
    /**
     * Get the searchable text of an element.
     */
    getText?: (element: HTMLElement) => string;
}

/**
 * The behavior controller for typeahead navigation.
 */
export interface TypeAheadBehavior {
    connected: boolean;
    connect(): void;
    disconnect(): void;
}

/**
 * Navigate focusable elements by typing their text.
 * @param node The target element.
 * @param options Behavior options.
 * @returns The behavior controller.
 */
export function typeAheadBehavior(
    node: HTMLElement,
    options: TypeAheadOptions
): TypeAheadBehavior {
    let connected = false;
    let value = '';
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const manager = focusManager(node, options);

    const clear = () => {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        value = '';
    };

    const onKeydown = (event: KeyboardEvent) => {
        if (
            event.defaultPrevented ||
            event.isComposing ||
            event.metaKey ||
            event.ctrlKey ||
            event.altKey ||
            event.key.length !== 1
        ) {
            clear();
            return;
        }

        const inputTarget = (event.target as HTMLElement)?.closest(
            'input, textarea, select, [contenteditable]'
        );
        if (inputTarget) {
            clear();
            return;
        }

        const activeElement = manager.getActiveElement();
        if (!activeElement || !node.contains(activeElement)) {
            return;
        }

        const elements = manager.findFocusable();
        if (!elements.length) {
            return;
        }

        value += event.key.toLowerCase();
        clearTimeout(timeoutId);
        timeoutId = setTimeout(clear, options.timeout ?? 600);

        // Repeated characters cycle through matching elements.
        const repeating =
            value.length > 1 && [...value].every((char) => char === value[0]);

        const query = repeating ? value[0] : value;
        const getText =
            options.getText ??
            ((element: HTMLElement) => element.textContent ?? '');

        let index = elements.indexOf(activeElement);
        if (index === -1) {
            index = elements.findIndex((el) => el.contains(activeElement));
        }

        // Single characters start after the current element.
        // Multi-character searches include the current element.
        const start =
            value.length === 1 || repeating ? index + 1 : Math.max(index, 0);

        for (let i = 0; i < elements.length; i++) {
            const element = elements[(start + i) % elements.length];
            const label = getText(element).trim().toLowerCase();

            if (label.startsWith(query)) {
                event.preventDefault();
                manager.focusNode(element);
                return;
            }
        }
    };

    return {
        get connected(): boolean {
            return connected;
        },
        connect(): void {
            if (connected) {
                return;
            }
            connected = true;
            node.addEventListener('keydown', onKeydown);
        },
        disconnect(): void {
            if (!connected) {
                return;
            }
            connected = false;
            node.removeEventListener('keydown', onKeydown);
            clear();
        },
    };
}
