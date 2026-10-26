import { focusEnterBehavior } from './focusEnterBehavior';
import { type FocusManagerOptions, focusManager } from './focusManager';
import { restoreAttribute } from './helpers';

/**
 * The behavior controller for focusing the first child element.
 */
export interface FocusFirstChildBehavior {
    connected: boolean;
    connect(): void;
    disconnect(): void;
}

/**
 * Focus first option on focus enter.
 * @param node The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusFirstChildBehavior(
    node: HTMLElement,
    options: FocusManagerOptions = {}
): FocusFirstChildBehavior {
    let activeElement: HTMLElement | null = null;
    let connected = false;
    let tabIndex: string | null = null;

    const manager = focusManager(node, options);
    const enterBehavior = focusEnterBehavior(node, {
        ...options,
        onEnter() {
            tabIndex = node.getAttribute('tabindex');
            node.setAttribute('tabindex', '-1');
        },
        onExit() {
            restoreAttribute(node, 'tabindex', tabIndex);
        },
    });

    const onFocus = () => {
        const elements = manager.findFocusable();
        const target = manager.getActiveElement();
        if (target === node) {
            if (activeElement && node.contains(activeElement)) {
                manager.focusNode(activeElement);
                return;
            }

            const firstElement = elements[0];
            if (firstElement) {
                manager.focusNode(firstElement);
            }
            return;
        }
        if (target && elements.includes(target)) {
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
            enterBehavior.connect();
            connected = true;
            activeElement = null;

            const target = manager.getActiveElement();
            if (target && node.contains(target)) {
                onFocus();
            }
            node.addEventListener('focus', onFocus, true);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            enterBehavior.disconnect();
            connected = false;
            activeElement = null;
            node.removeEventListener('focus', onFocus, true);
        },
    };
}
