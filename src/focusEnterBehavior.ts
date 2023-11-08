/**
 * The focus enter options.
 */
export interface FocusEnterOptions {
    /**
     * The callback when focus enter.
     */
    onEnter: (element: Element) => void;
    /**
     * The callback when focus exit.
     */
    onExit: () => void;
}

/**
 * Focus first option on focus enter.
 * @param element The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusEnterBehavior(element: HTMLElement, options: FocusEnterOptions) {
    const document = element.ownerDocument;
    const { onEnter, onExit } = options;
    let focused = false;
    let connected = false;

    const onFocusIn = () => {
        const activeElement = document.activeElement;
        if (focused || !activeElement) {
            return;
        }

        focused = true;
        onEnter(activeElement);
    };

    const onFocusOut = () => {
        if (!focused) {
            return;
        }

        setTimeout(() => {
            const activeElement = document.activeElement;
            if (element !== activeElement && !element.contains(activeElement)) {
                focused = false;
                onExit();
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
            element.addEventListener('focusin', onFocusIn);
            element.addEventListener('focusout', onFocusOut);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            connected = false;
            focused = false;
            element.removeEventListener('focusin', onFocusIn);
            element.removeEventListener('focusout', onFocusOut);
        },
    };
}
