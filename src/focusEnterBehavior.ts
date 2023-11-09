import type { FocusManagerOptions } from './focusManager';

/**
 * The focus enter options.
 */
export interface FocusEnterOptions extends FocusManagerOptions {
    /**
     * The callback when focus enter.
     */
    onEnter?: (element: Element) => void;
    /**
     * The callback when focus exit.
     */
    onExit?: () => void;
}

/**
 * Focus first option on focus enter.
 * @param node The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusEnterBehavior(node: HTMLElement, options: FocusEnterOptions = {}) {
    const document = node.ownerDocument;
    const { onEnter, onExit } = options;
    let focused = false;
    let connected = false;

    const onFocusIn = () => {
        const activeElement = document.activeElement;
        if (focused || !activeElement) {
            return;
        }

        focused = true;
        onEnter?.(activeElement);
    };

    const onFocusOut = () => {
        if (!focused) {
            return;
        }

        setTimeout(() => {
            const activeElement = document.activeElement;
            if (node !== activeElement && !node.contains(activeElement)) {
                focused = false;
                onExit?.();
            }
        });
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
            focused = false;
            if (document.activeElement && node.contains(document.activeElement)) {
                onFocusIn();
            }
            node.addEventListener('focusin', onFocusIn);
            node.addEventListener('focusout', onFocusOut);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            focused = false;
            node.removeEventListener('focusin', onFocusIn);
            node.removeEventListener('focusout', onFocusOut);
        },
    };
}
